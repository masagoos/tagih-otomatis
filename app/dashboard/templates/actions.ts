"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

const VALID_VARS = ["{{nama}}", "{{jumlah}}", "{{jatuh_tempo}}", "{{invoice}}", "{{usaha}}"];

function validateBody(body: string): string | null {
  if (!body.trim()) return "Isi pesan tidak boleh kosong.";
  if (body.length > 1000) return "Isi pesan maksimal 1000 karakter.";
  // Cek variabel {{...}} yang dipakai valid semua, biar tidak ada typo yang gagal senyap saat kirim nanti.
  const used = body.match(/\{\{[^}]*\}\}/g) ?? [];
  const invalid = used.filter((v) => !VALID_VARS.includes(v));
  if (invalid.length > 0) {
    return `Variabel tidak dikenal: ${invalid.join(", ")}. Variabel yang tersedia: ${VALID_VARS.join(", ")}`;
  }
  return null;
}

export async function updateTemplate(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!id || !name) redirect("/dashboard/templates?error=Data+tidak+lengkap");
  const bodyErr = validateBody(body);
  if (bodyErr) redirect(`/dashboard/templates?error=${encodeURIComponent(bodyErr)}`);

  const { error } = await supabase
    .from("message_templates")
    .update({ name, body })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) redirect(`/dashboard/templates?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/templates");
  redirect("/dashboard/templates?success=Template+disimpan");
}

export async function updateRule(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const sendHour = Number(formData.get("send_hour") ?? 9);
  const isActive = formData.get("is_active") === "on";

  if (!id) redirect("/dashboard/templates?error=Data+tidak+lengkap");
  if (sendHour < 6 || sendHour > 21)
    redirect("/dashboard/templates?error=Jam+kirim+harus+antara+06.00–21.00+(jaga+kesopanan)");

  const { error } = await supabase
    .from("reminder_rules")
    .update({ send_hour: sendHour, is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) redirect(`/dashboard/templates?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/templates");
  redirect("/dashboard/templates?success=Jadwal+disimpan");
}
