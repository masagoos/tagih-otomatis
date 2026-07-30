import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsApp, randomDelayMs, sleep } from "@/lib/fonnte";

export const maxDuration = 60;

type DueMessage = {
  id: string;
  user_id: string;
  to_phone: string;
  body: string;
  wa_devices: { api_token: string; status: string } | null;
  profiles: {
    plan: "trial" | "starter" | "pro";
    sub_status: string;
    trial_ends_at: string | null;
  } | null;
};

const BATCH_SIZE = 20;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: due, error: fetchErr } = await supabase
    .from("messages")
    .select(
      "id, user_id, to_phone, body, wa_devices(api_token, status), profiles!messages_user_id_fkey(plan, sub_status, trial_ends_at)"
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

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const raw of due as unknown as DueMessage[]) {
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
