"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

type Supa = Awaited<ReturnType<typeof createClient>>;

// Nomor invoice: INV-YYYYMM-0001, berurut per user per bulan.
// Loop kecil menangani tabrakan unique constraint (insert bersamaan).
async function insertInvoice(
  supabase: Supa,
  userId: string,
  data: { contact_id: string; amount: number; due_date: string; description: string | null }
): Promise<string | null> {
  const prefix = `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-`;
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .like("invoice_number", `${prefix}%`);

  for (let attempt = 0; attempt < 3; attempt++) {
    const num = `${prefix}${String((count ?? 0) + 1 + attempt).padStart(4, "0")}`;
    const { error } = await supabase.from("invoices").insert({
      user_id: userId,
      contact_id: data.contact_id,
      invoice_number: num,
      amount: data.amount,
      due_date: data.due_date,
      description: data.description,
    });
    if (!error) return null;
    if (!error.message.includes("duplicate")) return error.message;
  }
  return "Gagal membuat nomor invoice unik, coba lagi.";
}

// Cari kontak by nomor HP; buat baru kalau belum ada.
async function findOrCreateContact(
  supabase: Supa,
  userId: string,
  name: string,
  rawPhone: string
): Promise<{ id?: string; error?: string }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { error: `Nomor HP tidak valid: ${rawPhone}` };

  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("user_id", userId)
    .eq("phone", phone)
    .maybeSingle();
  if (existing) return { id: existing.id };

  const { data: created, error } = await supabase
    .from("contacts")
    .insert({ user_id: userId, name, phone })
    .select("id")
    .single();
  if (error || !created) return { error: error?.message ?? "Gagal membuat kontak" };
  return { id: created.id };
}

function parseAmount(raw: string): number {
  // terima "1500000", "1.500.000", "Rp 1.500.000"
  return Number(raw.replace(/[^0-9]/g, ""));
}

export async function createInvoice(formData: FormData) {
  const { supabase, user } = await requireUser();

  const contactChoice = String(formData.get("contact_id") ?? "new");
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const dueDate = String(formData.get("due_date") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!amount || amount <= 0) redirect("/dashboard/invoices/new?error=Nominal+tidak+valid");
  if (!dueDate) redirect("/dashboard/invoices/new?error=Tanggal+jatuh+tempo+wajib+diisi");

  let contactId: string;
  if (contactChoice === "new") {
    const name = String(formData.get("new_name") ?? "").trim();
    const phone = String(formData.get("new_phone") ?? "").trim();
    if (!name || !phone)
      redirect("/dashboard/invoices/new?error=Nama+dan+nomor+HP+pelanggan+baru+wajib+diisi");
    const result = await findOrCreateContact(supabase, user.id, name, phone);
    if (result.error || !result.id)
      redirect(`/dashboard/invoices/new?error=${encodeURIComponent(result.error ?? "Gagal")}`);
    contactId = result.id;
  } else {
    contactId = contactChoice;
  }

  const err = await insertInvoice(supabase, user.id, {
    contact_id: contactId,
    amount,
    due_date: dueDate,
    description,
  });
  if (err) redirect(`/dashboard/invoices/new?error=${encodeURIComponent(err)}`);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices?success=1");
}

export async function markInvoicePaid(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: inv } = await supabase
    .from("invoices")
    .select("amount")
    .eq("id", id)
    .maybeSingle();
  if (!inv) return;

  await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      paid_amount: inv.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Batalkan pengingat yang masih antre — pelanggan sudah bayar, jangan ditagih lagi.
  await supabase
    .from("messages")
    .update({ status: "cancelled" })
    .eq("invoice_id", id)
    .eq("status", "queued");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
}

export async function cancelInvoice(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("invoices")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["unpaid", "overdue"]);

  await supabase
    .from("messages")
    .update({ status: "cancelled" })
    .eq("invoice_id", id)
    .eq("status", "queued");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
}

export type ImportRow = {
  name: string;
  phone: string;
  amount: string;
  due_date: string; // YYYY-MM-DD
  description?: string;
};

export async function importInvoices(
  rows: ImportRow[]
): Promise<{ imported: number; errors: string[] }> {
  const { supabase, user } = await requireUser();
  const errors: string[] = [];
  let imported = 0;

  for (const [i, row] of rows.slice(0, 200).entries()) {
    const label = `Baris ${i + 1} (${row.name || "?"})`;
    const amount = parseAmount(row.amount ?? "");
    if (!row.name?.trim() || !row.phone?.trim()) {
      errors.push(`${label}: nama/nomor HP kosong`);
      continue;
    }
    if (!amount || amount <= 0) {
      errors.push(`${label}: nominal tidak valid`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.due_date ?? "")) {
      errors.push(`${label}: tanggal harus format YYYY-MM-DD atau DD/MM/YYYY`);
      continue;
    }

    const contact = await findOrCreateContact(supabase, user.id, row.name.trim(), row.phone);
    if (contact.error || !contact.id) {
      errors.push(`${label}: ${contact.error}`);
      continue;
    }

    const err = await insertInvoice(supabase, user.id, {
      contact_id: contact.id,
      amount,
      due_date: row.due_date,
      description: row.description?.trim() || null,
    });
    if (err) {
      errors.push(`${label}: ${err}`);
      continue;
    }
    imported++;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  return { imported, errors };
}

export async function createContact(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  if (!name || !rawPhone)
    redirect("/dashboard/contacts?error=Nama+dan+nomor+HP+wajib+diisi");

  const result = await findOrCreateContact(supabase, user.id, name, rawPhone);
  if (result.error)
    redirect(`/dashboard/contacts?error=${encodeURIComponent(result.error)}`);

  revalidatePath("/dashboard/contacts");
  redirect("/dashboard/contacts");
}
