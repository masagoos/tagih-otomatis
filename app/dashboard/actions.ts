"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

const DEFAULT_TEMPLATES = [
  {
    name: "Pengingat H-3",
    offset_days: -3,
    body: "Halo {{nama}}, kami dari {{usaha}}. Mengingatkan tagihan {{invoice}} sebesar Rp{{jumlah}} jatuh tempo pada {{jatuh_tempo}}. Terima kasih 🙏",
  },
  {
    name: "Jatuh Tempo Hari Ini",
    offset_days: 0,
    body: "Halo {{nama}}, tagihan {{invoice}} sebesar Rp{{jumlah}} jatuh tempo hari ini ({{jatuh_tempo}}). Mohon konfirmasi jika sudah dibayar ya. Terima kasih 🙏 — {{usaha}}",
  },
  {
    name: "Lewat 3 Hari",
    offset_days: 3,
    body: "Halo {{nama}}, tagihan {{invoice}} sebesar Rp{{jumlah}} sudah lewat jatuh tempo ({{jatuh_tempo}}). Mohon segera diselesaikan ya. Abaikan pesan ini jika sudah membayar 🙏 — {{usaha}}",
  },
  {
    name: "Lewat 7 Hari",
    offset_days: 7,
    body: "Halo {{nama}}, kami belum menerima pembayaran tagihan {{invoice}} sebesar Rp{{jumlah}} (jatuh tempo {{jatuh_tempo}}). Jika ada kendala, silakan hubungi kami untuk mengatur ulang. Terima kasih 🙏 — {{usaha}}",
  },
];

export async function completeProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const businessName = String(formData.get("business_name") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));

  if (!businessName || !ownerName || !phone) {
    redirect("/dashboard?error=data-tidak-lengkap");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    business_name: businessName,
    owner_name: ownerName,
    phone,
  });
  if (profileError) redirect(`/dashboard?error=${encodeURIComponent(profileError.message)}`);

  // Seed template & jadwal pengingat default agar user langsung siap pakai
  for (const t of DEFAULT_TEMPLATES) {
    const { data: template } = await supabase
      .from("message_templates")
      .insert({ user_id: user.id, name: t.name, body: t.body, is_default: true })
      .select("id")
      .single();
    if (template) {
      await supabase.from("reminder_rules").insert({
        user_id: user.id,
        offset_days: t.offset_days,
        template_id: template.id,
        send_hour: 9,
      });
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
