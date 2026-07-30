import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Fonnte mengirim field yang tidak selalu konsisten antar event; kita simpan
// payload mentah dulu (untuk debug/replay), baru best-effort update status pesan.
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const externalId = String(payload.id ?? payload.messageId ?? crypto.randomUUID());

  const { error: logErr } = await supabase.from("webhook_events").insert({
    source: "fonnte",
    external_id: externalId,
    payload,
  });
  // Duplicate webhook (Fonnte kadang kirim ulang) — bukan error, cukup diabaikan.
  if (logErr && !logErr.message.includes("duplicate")) {
    return NextResponse.json({ error: logErr.message }, { status: 500 });
  }

  const status = String(payload.status ?? payload.state ?? "").toLowerCase();
  const providerMsgId = String(payload.id ?? "");

  if (providerMsgId) {
    if (["delivered", "read", "sent"].some((s) => status.includes(s))) {
      await supabase
        .from("messages")
        .update({ status: "delivered" })
        .eq("provider_msg_id", providerMsgId)
        .eq("status", "sent");
    } else if (["failed", "error", "rejected"].some((s) => status.includes(s))) {
      await supabase
        .from("messages")
        .update({ status: "failed", error_detail: `Webhook: ${status}` })
        .eq("provider_msg_id", providerMsgId)
        .in("status", ["sent", "queued"]);
    }
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("source", "fonnte")
    .eq("external_id", externalId);

  return NextResponse.json({ ok: true });
}
