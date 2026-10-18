"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/phone";
import { sendWhatsApp } from "@/lib/fonnte";

// Kirim notifikasi WA ke Founder saat ada pendaftar affiliate baru. Dibungkus
// try/catch dan TIDAK PERNAH melempar error — notifikasi cuma "nice to have",
// kalau gagal (device WA terputus dsb) pendaftaran affiliate tetap harus sukses.
async function notifyFounderNewLead(admin: ReturnType<typeof createAdminClient>, lead: {
  name: string;
  email: string;
  phone: string | null;
  network: string | null;
}) {
  try {
    const founderNumber = process.env.FOUNDER_WA_NUMBER;
    if (!founderNumber) return;

    // .limit(1) alih-alih .maybeSingle() — kalau nomor Founder kebetulan tersambung
    // sebagai lebih dari satu baris wa_devices (pernah terjadi), maybeSingle() akan
    // diam-diam gagal (mengembalikan error, bukan throw) dan notifikasi tidak pernah
    // terkirim tanpa jejak apa pun. Ambil satu saja, itu cukup untuk kirim pesan.
    const { data: devices } = await admin
      .from("wa_devices")
      .select("api_token")
      .eq("phone_number", founderNumber)
      .eq("status", "connected")
      .limit(1);
    const device = devices?.[0];
    if (!device?.api_token) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tagihotomatis.id";
    const message = [
      "🎉 Pendaftar affiliate baru!",
      "",
      `Nama: ${lead.name}`,
      `Email: ${lead.email}`,
      lead.phone ? `WA: ${lead.phone}` : null,
      lead.network ? `Jaringan: ${lead.network}` : null,
      "",
      `Cek & proses di: ${appUrl}/dashboard/admin/affiliates`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendWhatsApp(device.api_token, founderNumber, message);
  } catch (err) {
    console.error("Gagal kirim notifikasi WA affiliate lead:", err);
  }
}

export async function submitAffiliateLead(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const network = String(formData.get("network") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();

  if (!name || !email || !email.includes("@")) {
    redirect("/affiliate?error=data-tidak-lengkap");
  }

  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("affiliate_leads").insert({
    name,
    network: network || null,
    email,
    phone,
  });

  if (error) {
    redirect(`/affiliate?error=${encodeURIComponent(error.message)}`);
  }

  await notifyFounderNewLead(supabase, { name, email, phone, network: network || null });

  redirect("/affiliate?success=1");
}
