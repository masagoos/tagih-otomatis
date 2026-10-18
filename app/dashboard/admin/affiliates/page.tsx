import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/phone";
import { createAffiliateFromLead, rejectLead, deleteLead, markCommissionPaid, toggleAffiliateStatus, sendAffiliateLinkWA } from "./actions";
import AffiliateSearch from "./affiliate-search";

const TIER_LABEL: Record<string, string> = {
  affiliate: "Affiliate (20%)",
  perak: "Affiliate Perak (25%)",
  emas: "Affiliate Emas (30%)",
};

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; code?: string; q?: string }>;
}) {
  const { error, success, code, q } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.email !== process.env.FOUNDER_EMAIL) redirect("/dashboard");

  const admin = createAdminClient();

  const [{ data: leads }, { data: affiliates }, { data: commissions }] = await Promise.all([
    admin
      .from("affiliate_leads")
      .select("id, name, email, phone, network, status, created_at")
      .in("status", ["new", "contacted"])
      .order("created_at", { ascending: false }),
    admin
      .from("affiliates")
      .select("id, code, name, email, phone, tier, commission_rate, status, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("affiliate_commissions")
      .select("id, amount, rate, status, created_at, paid_at, affiliates(name, code), profiles(business_name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const affiliateList = affiliates ?? [];
  const commissionList = commissions ?? [];
  const referredCounts = new Map<string, number>();
  const paidByAffiliate = new Map<string, number>();
  if (affiliateList.length > 0) {
    const [{ data: profileCounts }, { data: paidCommissions }] = await Promise.all([
      admin.from("profiles").select("referred_by").not("referred_by", "is", null),
      admin.from("affiliate_commissions").select("affiliate_id, amount").eq("status", "paid"),
    ]);
    for (const p of profileCounts ?? []) {
      const key = p.referred_by as string;
      referredCounts.set(key, (referredCounts.get(key) ?? 0) + 1);
    }
    for (const c of paidCommissions ?? []) {
      paidByAffiliate.set(c.affiliate_id, (paidByAffiliate.get(c.affiliate_id) ?? 0) + Number(c.amount));
    }
  }

  const totalUnpaid = commissionList
    .filter((c) => c.status === "unpaid")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPaid = commissionList
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const activeAffiliateCount = affiliateList.filter((a) => a.status === "active").length;

  const query = (q ?? "").trim().toLowerCase();
  const filteredAffiliates = query
    ? affiliateList.filter((a) =>
        [a.name, a.email, a.code].some((field) => field?.toLowerCase().includes(query))
      )
    : affiliateList;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Affiliate</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ubah pendaftar menjadi affiliate resmi, dan pantau komisi yang harus dibayar.
          </p>
        </div>
        <AffiliateSearch />
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success === "affiliate-dibuat" && (() => {
        const newAffiliate = affiliateList.find((a) => a.code === code);
        const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/?ref=${code}`;
        const shareText = newAffiliate
          ? `Halo ${newAffiliate.name}! Anda resmi jadi Affiliate Tagih Otomatis.\n\nKode referral Anda: ${code}\nLink referral pribadi Anda:\n${referralLink}\n\nBagikan link ini ke jaringan Anda — setiap pelanggan yang berlangganan lewatnya, komisinya otomatis tercatat untuk Anda.`
          : "";
        const mailtoHref = newAffiliate?.email
          ? `mailto:${encodeURIComponent(newAffiliate.email)}?subject=${encodeURIComponent("Link Referral Affiliate Tagih Otomatis")}&body=${encodeURIComponent(shareText)}`
          : undefined;
        return (
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            <p>
              ✓ Affiliate berhasil dibuat.
              <br />
              Kode referral: <strong>{code}</strong> — link: <span className="font-mono">{referralLink}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {newAffiliate?.phone ? (
                <form action={sendAffiliateLinkWA}>
                  <input type="hidden" name="affiliate_id" value={newAffiliate.id} />
                  <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                    📱 Kirim Link via WA
                  </button>
                </form>
              ) : (
                <span className="text-xs text-green-600/70">Tidak ada nomor WA tercatat untuk kirim otomatis.</span>
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
        );
      })()}
      {success === "wa-terkirim" && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Link referral berhasil dikirim via WhatsApp.
        </div>
      )}
      {success === "affiliate-diperbarui" && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Data affiliate berhasil diperbarui.</div>
      )}
      {success === "affiliate-dihapus" && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Affiliate berhasil dihapus.</div>
      )}
      {success === "lead-dihapus" && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Pendaftar berhasil dihapus.</div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Affiliate Aktif</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{activeAffiliateCount}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Pendaftar Baru</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{leads?.length ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Komisi Belum Dibayar</p>
          <p className="mt-1 text-xl font-bold text-red-600">{formatRupiah(totalUnpaid)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Komisi Sudah Dibayar</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatRupiah(totalPaid)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Pendaftar Baru</h2>
        {!leads || leads.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Tidak ada pendaftar baru.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-500">
                    {lead.email} {lead.phone && `· ${lead.phone}`} {lead.network && `· ${lead.network}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={createAffiliateFromLead} className="flex items-center gap-2">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <select name="tier" className="rounded-lg border px-2 py-1.5 text-sm" defaultValue="affiliate">
                      <option value="affiliate">Affiliate (20%)</option>
                      <option value="perak">Perak (25%)</option>
                      <option value="emas">Emas (30%)</option>
                    </select>
                    <button className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700">
                      Jadikan Affiliate
                    </button>
                  </form>
                  <form action={rejectLead}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <button className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">
                      Tolak
                    </button>
                  </form>
                  <form action={deleteLead}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Daftar Affiliate</h2>
        <p className="mt-1 text-xs text-gray-400">Komisi dibayarkan 2x sebulan, tanggal 15 dan 30.</p>
        {affiliateList.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Belum ada affiliate resmi.</p>
        ) : filteredAffiliates.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Tidak ada affiliate yang cocok dengan pencarian &quot;{q}&quot;.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Kode / Link</th>
                  <th className="py-2 pr-4">Tingkatan</th>
                  <th className="py-2 pr-4">Referral</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Total Komisi Dibayar</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/dashboard/admin/affiliates/${a.id}`}
                        className="font-medium text-gray-900 hover:text-violet-700 hover:underline"
                      >
                        {a.name}
                      </Link>
                      <p className="text-xs text-gray-400">{a.email}</p>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-500">?ref={a.code}</td>
                    <td className="py-2 pr-4 text-gray-500">{TIER_LABEL[a.tier] ?? a.tier}</td>
                    <td className="py-2 pr-4 text-gray-900">{referredCounts.get(a.id) ?? 0}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          a.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {a.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {formatRupiah(paidByAffiliate.get(a.id) ?? 0)}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <form action={toggleAffiliateStatus}>
                          <input type="hidden" name="affiliate_id" value={a.id} />
                          <input type="hidden" name="next_status" value={a.status === "active" ? "inactive" : "active"} />
                          <button className="text-xs text-gray-500 underline hover:text-gray-900">
                            {a.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                        <Link
                          href={`/dashboard/admin/affiliates/${a.id}/edit`}
                          className="text-xs text-violet-600 underline hover:text-violet-800"
                        >
                          Ubah
                        </Link>
                        <Link
                          href={`/dashboard/admin/affiliates/${a.id}/delete`}
                          className="text-xs text-red-600 underline hover:text-red-800"
                        >
                          Hapus
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Riwayat Komisi</h2>
        <p className="mt-1 text-xs text-gray-400">50 komisi terbaru, tercatat otomatis saat pembayaran referral dikonfirmasi Mayar.</p>
        {commissionList.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Belum ada komisi tercatat.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">Affiliate</th>
                  <th className="py-2 pr-4">Pelanggan Direferensikan</th>
                  <th className="py-2 pr-4">Komisi</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {commissionList.map((c) => {
                  const aff = c.affiliates as unknown as { name: string; code: string } | null;
                  const referredProfile = c.profiles as unknown as { business_name: string } | null;
                  return (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-2 pr-4 text-gray-900">{aff?.name ?? "-"}</td>
                      <td className="py-2 pr-4 text-gray-500">{referredProfile?.business_name ?? "-"}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">{formatRupiah(Number(c.amount))}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            c.status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status === "paid" ? "Sudah dibayar" : "Belum dibayar"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {c.status === "unpaid" && (
                          <form action={markCommissionPaid}>
                            <input type="hidden" name="commission_id" value={c.id} />
                            <button className="text-xs text-violet-600 underline hover:text-violet-800">
                              Tandai Dibayar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
