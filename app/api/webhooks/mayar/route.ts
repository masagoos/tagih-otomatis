import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Mayar TIDAK mendokumentasikan mekanisme tanda tangan webhook. Mitigasi:
// 1) token rahasia di query string (URL webhook tidak boleh disebar)
// 2) hanya proses productId yang cocok dengan payment 'pending' yang KITA buat sendiri
//    (bukan percaya identitas dari body webhook begitu saja)
// 3) verifikasi nominal cocok dengan yang tercatat saat link dibuat
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.MAYAR_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = (payload.data ?? {}) as Record<string, unknown>;
  const externalId = String(data.id ?? crypto.randomUUID());

  const { error: logErr } = await supabase.from("webhook_events").insert({
    source: "mayar",
    external_id: externalId,
    payload,
  });
  if (logErr && !logErr.message.includes("duplicate")) {
    return NextResponse.json({ error: logErr.message }, { status: 500 });
  }
  // Webhook duplikat (Mayar retry) — sudah tercatat sebelumnya, jangan diproses dobel.
  if (logErr?.message.includes("duplicate")) {
    return NextResponse.json({ ok: true, note: "duplicate, skipped" });
  }

  const productId = String(data.productId ?? "");
  const paidStatus = data.status === true;
  const paidAmount = Number(data.amount ?? 0);

  if (productId && paidStatus) {
    const { data: payment } = await supabase
      .from("payments")
      .select("id, user_id, plan, amount, status")
      .eq("mayar_link_id", productId)
      .eq("status", "pending")
      .maybeSingle();

    if (payment && Number(payment.amount) === paidAmount) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, plan_expires_at")
        .eq("id", payment.user_id)
        .single();

      // Perpanjang dari tanggal expired sekarang kalau masih aktif (belum lewat),
      // atau dari sekarang kalau sudah lewat/belum pernah bayar — supaya tidak rugi
      // kalau user bayar lebih awal sebelum masa aktif habis.
      const currentExpiry = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null;
      const base = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

      await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          mayar_transaction_id: externalId,
          period_start: new Date().toISOString(),
          period_end: newExpiry.toISOString(),
        })
        .eq("id", payment.id);

      await supabase
        .from("profiles")
        .update({
          plan: payment.plan,
          sub_status: "active",
          plan_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.user_id);
    }
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("source", "mayar")
    .eq("external_id", externalId);

  return NextResponse.json({ ok: true });
}
