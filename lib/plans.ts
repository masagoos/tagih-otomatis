import type { SupabaseClient } from "@supabase/supabase-js";

// Batas jumlah tagihan baru per bulan kalender, per paket berbayar.
// Paket trial tidak dibatasi di sini (dibatasi lewat kuota pesan di plan_limits).
export const PLAN_INVOICE_LIMIT: Record<"starter" | "pro", number> = {
  starter: 50,
  pro: 150,
};

const PLAN_LABEL: Record<"starter" | "pro", string> = {
  starter: "Starter",
  pro: "Pro",
};

// Pesan error kalau user sudah mencapai batas tagihan bulan ini, atau null kalau masih boleh.
// Hitungannya sama dengan penomoran invoice (INV-YYYYMM-xxxx): semua tagihan yang dibuat
// bulan ini, termasuk yang dibatalkan.
export async function invoiceQuotaError(
  supabase: SupabaseClient,
  userId: string,
  plan: string | null | undefined
): Promise<string | null> {
  if (plan !== "starter" && plan !== "pro") return null;
  const limit = PLAN_INVOICE_LIMIT[plan];

  const prefix = `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-`;
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .like("invoice_number", `${prefix}%`);

  if ((count ?? 0) < limit) return null;

  const upgrade =
    plan === "starter"
      ? ` Upgrade ke Pro untuk ${PLAN_INVOICE_LIMIT.pro} tagihan per bulan.`
      : "";
  return `Batas ${limit} tagihan per bulan untuk paket ${PLAN_LABEL[plan]} sudah tercapai.${upgrade}`;
}
