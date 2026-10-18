import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsApp, randomDelayMs, sleep } from "@/lib/fonnte";

export const maxDuration = 60;

type DueMessage = {
  id: string;
  user_id: string;
  device_id: string | null;
  to_phone: string;
  body: string;
  wa_devices: { api_token: string; status: string } | null;
  profiles: {
    plan: "trial" | "starter" | "pro";
    sub_status: string;
    trial_ends_at: string | null;
  } | null;
};

// Diambil per satu kali proses cron. Angka kecil sengaja dipakai karena jeda antar
// pesan sekarang lebih panjang (lihat randomDelayMs) — sisa pesan yang belum
// sempat diproses otomatis lanjut di proses cron berikutnya, tidak hilang.
const BATCH_SIZE = 8;

// Waktu maksimum fungsi ini boleh jalan sebelum Vercel memaksa hentikan
// (maxDuration di bawah). Berhenti lebih awal di sini supaya tidak terputus
// di tengah pengiriman — pesan yang belum diproses tetap 'queued', aman
// dilanjutkan di proses cron berikutnya.
const RUNTIME_BUDGET_MS = 45_000;

// Batas aman kirim per nomor WA per hari — mitigasi risiko banned oleh WhatsApp.
// Fonnte adalah otomatisasi TIDAK RESMI (meniru WhatsApp Web/multi-device), jadi
// tidak ada angka resmi dari Meta untuk ini; 150/hari dipilih sebagai batas
// konservatif untuk nomor yang sudah lama dipakai wajar (bukan nomor baru).
// Bisa disetel lewat env WA_DAILY_LIMIT_PER_DEVICE kalau perlu disesuaikan.
const DAILY_LIMIT_PER_DEVICE = Number(process.env.WA_DAILY_LIMIT_PER_DEVICE ?? 150);

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function jakartaTodayStartUtc(): Date {
  const jakartaDateStr = new Date(Date.now() + JAKARTA_OFFSET_MS).toISOString().slice(0, 10);
  return new Date(new Date(`${jakartaDateStr}T00:00:00Z`).getTime() - JAKARTA_OFFSET_MS);
}

export async function GET(request: NextRequest) {
  // Terima secret lewat header (Vercel Cron) ATAU query param (layanan cron gratis
  // yang tidak mendukung custom header, mis. cron-job.org).
  const auth = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("token");
  const isAuthorized =
    auth === `Bearer ${process.env.CRON_SECRET}` || queryToken === process.env.CRON_SECRET;
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: due, error: fetchErr } = await supabase
    .from("messages")
    .select(
      "id, user_id, device_id, to_phone, body, wa_devices(api_token, status), profiles!messages_user_id_fkey(plan, sub_status, trial_ends_at)"
    )
    .eq("status", "queued")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!due || due.length === 0) {
    return NextResponse.json({ processed: 0, sent: 0, failed: 0, skipped: 0 });
  }

  const { data: limitsRows } = await supabase.from("plan_limits").select("plan, monthly_messages");
  const limits = new Map((limitsRows ?? []).map((l) => [l.plan, l.monthly_messages]));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Hitung berapa pesan yang SUDAH terkirim hari ini (waktu Jakarta) per nomor WA,
  // supaya bisa dihentikan begitu satu nomor mencapai DAILY_LIMIT_PER_DEVICE —
  // pengaman utama terhadap risiko banned kalau ada lonjakan (mis. import CSV
  // ratusan pelanggan dengan tanggal jatuh tempo yang sama).
  const deviceIds = Array.from(
    new Set((due as unknown as DueMessage[]).map((m) => m.device_id).filter((id): id is string => !!id))
  );
  const sentTodayByDevice = new Map<string, number>();
  if (deviceIds.length > 0) {
    const { data: sentTodayRows } = await supabase
      .from("messages")
      .select("device_id")
      .in("device_id", deviceIds)
      .in("status", ["sent", "delivered"])
      .gte("sent_at", jakartaTodayStartUtc().toISOString());
    for (const r of sentTodayRows ?? []) {
      if (r.device_id) sentTodayByDevice.set(r.device_id, (sentTodayByDevice.get(r.device_id) ?? 0) + 1);
    }
  }

  const startedAt = Date.now();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const raw of due as unknown as DueMessage[]) {
    // Berhenti lebih awal kalau mendekati batas waktu Vercel — sisa pesan tetap
    // 'queued' dan otomatis dilanjutkan di proses cron berikutnya.
    if (Date.now() - startedAt > RUNTIME_BUDGET_MS) break;

    const device = raw.wa_devices;
    const profile = raw.profiles;

    if (!profile || profile.sub_status !== "active") {
      await supabase
        .from("messages")
        .update({ status: "failed", error_detail: "Langganan tidak aktif" })
        .eq("id", raw.id);
      skipped++;
      continue;
    }
    // sub_status tetap 'active' selama trial berjalan — cek kedaluwarsa trial terpisah,
    // karena tidak ada proses lain yang otomatis mengubah status saat trial habis.
    if (
      profile.plan === "trial" &&
      profile.trial_ends_at &&
      new Date(profile.trial_ends_at) < new Date()
    ) {
      await supabase
        .from("messages")
        .update({ status: "failed", error_detail: "Masa uji coba berakhir, silakan upgrade paket" })
        .eq("id", raw.id);
      skipped++;
      continue;
    }
    if (!device || device.status !== "connected") {
      await supabase
        .from("messages")
        .update({ status: "failed", error_detail: "Perangkat WA tidak tersambung" })
        .eq("id", raw.id);
      skipped++;
      continue;
    }

    const limit = limits.get(profile.plan) ?? 0;
    const { count: usedThisMonth } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", raw.user_id)
      .in("status", ["sent", "delivered"])
      .gte("sent_at", monthStart.toISOString());

    if ((usedThisMonth ?? 0) >= limit) {
      await supabase
        .from("messages")
        .update({ status: "failed", error_detail: "Kuota pesan bulanan tercapai" })
        .eq("id", raw.id);
      skipped++;
      continue;
    }

    // Nomor WA ini sudah mencapai batas aman harian — JANGAN ditandai 'failed'.
    // Biarkan tetap 'queued' supaya otomatis terkirim besok begitu batas reset,
    // bukan hilang/dianggap gagal permanen.
    if (raw.device_id && (sentTodayByDevice.get(raw.device_id) ?? 0) >= DAILY_LIMIT_PER_DEVICE) {
      skipped++;
      continue;
    }

    const result = await sendWhatsApp(device.api_token, raw.to_phone, raw.body);

    if (result.ok) {
      await supabase
        .from("messages")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_msg_id: result.providerMsgId,
        })
        .eq("id", raw.id);
      sent++;
      if (raw.device_id) {
        sentTodayByDevice.set(raw.device_id, (sentTodayByDevice.get(raw.device_id) ?? 0) + 1);
      }
    } else {
      await supabase
        .from("messages")
        .update({ status: "failed", error_detail: result.error })
        .eq("id", raw.id);
      failed++;
    }

    // Jeda acak antar pesan — mitigasi risiko nomor WA kena banned.
    await sleep(randomDelayMs());
  }

  return NextResponse.json({ processed: due.length, sent, failed, skipped });
}
