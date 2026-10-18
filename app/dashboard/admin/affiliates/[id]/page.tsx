import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/phone";
import { sendAffiliateLinkWA, toggleAffiliateStatus } from "../actions";

const TIER_LABEL: Record<string, string> = {
  affiliate: "Affiliate (20%)",
  perak: "Affiliate Perak (25%)",
  emas: "Affiliate Emas (30%)",
};

export default async function AffiliateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.email !== process.env.FOUNDER_EMAIL) redirect("/dashboard");

  const admin = createAdminClient();
  const { data: affiliate } = await admin
    .from("affiliates")
    .select("id, code, name, email, phone, tier, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!affiliate) notFound();

  const [{ count: referredCount }, { data: paidCommissions }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", affiliate.id),
    admin.from("affiliate_commissions").select("amount").eq("affiliate_id", affiliate.id).eq("status", "paid"),
  ]);
  const totalPaid = (paidCommissions ?? []).reduce((sum, c) => sum + Number(c.amount), 0);

  const returnTo = `/dashboard/admin/affiliates/${affiliate.id}`;
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/?ref=${affiliate.code}`;
  const shareText = `Halo ${affiliate.name}! Anda resmi jadi Affiliate Tagih Otomatis.\n\nKode referral Anda: ${affiliate.code}\nLink referral pribadi Anda:\n${referralLink}\n\nBagikan link ini ke jaringan Anda — setiap pelanggan yang berlangganan lewatnya, komisinya otomatis tercatat untuk Anda.`;
  const mailtoHref = affiliate.email
    ? `mailto:${encodeURIComponent(affiliate.email)}?subject=${encodeURIComponent("Link Referral Affiliate Tagih Otomatis")}&body=${encodeURIComponent(shareText)}`
    : undefined;

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/admin/affiliates" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke Kelola Affiliate
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{affiliate.name}</h1>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            affiliate.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
          }`}
        >
          {affiliate.status === "active" ? "Aktif" : "Nonaktif"}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{affiliate.email}</p>

      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success === "wa-terkirim" && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Link referral berhasil dikirim via WhatsApp.
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Tingkatan</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{TIER_LABEL[affiliate.tier] ?? affiliate.tier}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Referral</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{referredCount ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Komisi Dibayar</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatRupiah(totalPaid)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-700">
          Kode referral: <strong>{affiliate.code}</strong>
        </p>
        <p className="mt-1 break-all font-mono text-xs text-gray-500">{referralLink}</p>
        {affiliate.phone && <p className="mt-1 text-xs text-gray-500">WA: {affiliate.phone}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {affiliate.phone ? (
            <form action={sendAffiliateLinkWA}>
              <input type="hidden" name="affiliate_id" value={affiliate.id} />
              <input type="hidden" name="redirect_to" value={returnTo} />
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                📱 Kirim Link via WA
              </button>
            </form>
          ) : (
            <span className="text-xs text-gray-400">Tidak ada nomor WA tercatat untuk kirim otomatis.</span>
          )}
          {mailtoHref && (
            <a
              href={mailtoHref}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              📧 Kirim Link via Email
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <form action={toggleAffiliateStatus}>
          <input type="hidden" name="affiliate_id" value={affiliate.id} />
          <input type="hidden" name="next_status" value={affiliate.status === "active" ? "inactive" : "active"} />
          <button className="text-sm text-gray-500 underline hover:text-gray-900">
            {affiliate.status === "active" ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
        <Link href={`/dashboard/admin/affiliates/${affiliate.id}/edit`} className="text-sm text-violet-600 underline hover:text-violet-800">
          Ubah
        </Link>
        <Link href={`/dashboard/admin/affiliates/${affiliate.id}/delete`} className="text-sm text-red-600 underline hover:text-red-800">
          Hapus
        </Link>
      </div>
    </div>
  );
}
