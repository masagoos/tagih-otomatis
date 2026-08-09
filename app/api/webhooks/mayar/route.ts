import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// Satu akun Mayar (masagooscheck@gmail.com) dipakai 2 produk, tapi Mayar cuma
// kasih SATU slot URL webhook per akun — jadi URL-nya tetap di sini (tagihotomatis.id),
// dan payment link yang tidak cocok dengan payment 'pending' Tagih Otomatis dicoba
// lagi ke Supabase Auto-Posting Sosmed sebelum dianggap tidak dikenal.
function createAutoPostingSosmedClient() {
  const url = process.env.AUTOPOSTING_SUPABASE_URL;
  const key = process.env.AUTOPOSTING_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

async function processAutoPostingSosmedPayment(productId: string, paidAmount: number, externalId: string) {
  const apClient = createAutoPostingSosmedClient();
  if (!apClient) return;

  const { data: payment } = await apClient
    .from("payments")
    .select("id, client_id, plan, amount, status")
    .eq("mayar_link_id", productId)
    .eq("status", "pending")
    .maybeSingle();
  if (!payment || Number(payment.amount) !== paidAmount) return;

  const { data: client } = await apClient
    .from("clients")
    .select("paid_until")
    .eq("id", payment.client_id)
    .single();

  const currentExpiry = client?.paid_until ? new Date(client.paid_until) : null;
  const base = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

  await apClient
    .from("payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      mayar_transaction_id: externalId,
      period_start: new Date().toISOString(),
      period_end: newExpiry.toISOString(),
    })
    .eq("id", payment.id);

  await apClient
    .from("clients")
    .update({
      plan: payment.plan,
      subscription_status: "active",
      paid_until: newExpiry.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.client_id);
}

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

  // "payment.received" = pembayaran benar-benar lunas. data.status TIDAK bisa dipakai
  // sebagai penanda lunas — Mayar mengirim data.status: "SUCCESS" (string) bahkan pada
  // event "payment.reminder" (tagihan yang BELUM dibayar), jadi field itu hanya menandakan
  // webhook-nya terkirim sukses, bukan status pembayarannya.
  const productId = String(data.productId ?? "");
  const paidStatus = payload.event === "payment.received";
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
        .select("plan, plan_expires_at, referred_by")
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

      // Kalau user ini direferensikan affiliate, catat komisinya. unique(payment_id)
      // mencegah dobel-catat kalau webhook ini diproses ulang (retry Mayar).
      if (profile?.referred_by) {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id, commission_rate")
          .eq("id", profile.referred_by)
          .eq("status", "active")
          .maybeSingle();

        if (affiliate) {
          const commissionAmount = Number(affiliate.commission_rate) * paidAmount;
          const { error: commissionErr } = await supabase.from("affiliate_commissions").insert({
            affiliate_id: affiliate.id,
            user_id: payment.user_id,
            payment_id: payment.id,
            amount: commissionAmount,
            rate: affiliate.commission_rate,
          });
          if (commissionErr && !commissionErr.message.includes("duplicate")) {
            console.error("Gagal mencatat komisi affiliate:", commissionErr.message);
          }
        }
      }
    } else {
      // Bukan payment link Tagih Otomatis — coba Auto-Posting Sosmed
      // (produk lain yang berbagi akun Mayar & webhook URL yang sama).
      await processAutoPostingSosmedPayment(productId, paidAmount, externalId);
    }
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("source", "mayar")
    .eq("external_id", externalId);

  return NextResponse.json({ ok: true });
}
