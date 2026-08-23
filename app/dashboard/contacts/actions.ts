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

export async function updateContact(formData: FormData) {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !rawPhone) {
    redirect(`/dashboard/contacts/${id}/edit?error=Nama+dan+nomor+HP+wajib+diisi`);
  }
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    redirect(`/dashboard/contacts/${id}/edit?error=Nomor+HP+tidak+valid`);
  }
  if (email && !email.includes("@")) {
    redirect(`/dashboard/contacts/${id}/edit?error=Format+email+tidak+valid`);
  }

  const { error } = await supabase
    .from("contacts")
    .update({ name, phone, email: email || null })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard/contacts/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/contacts");
  redirect("/dashboard/contacts?success=diperbarui");
}

export async function deleteContact(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");

  // Soft-delete (is_active=false) — konsisten dengan pola cancelInvoice: riwayat
  // tagihan lama yang masih menunjuk contact_id ini tetap utuh, tidak dihapus paksa.
  const { error } = await supabase
    .from("contacts")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard/contacts?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/contacts");
  redirect("/dashboard/contacts?success=dihapus");
}
