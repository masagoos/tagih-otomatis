import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";

const MESSAGE_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  queued: { label: "Menunggu jadwal", cls: "bg-gray-100 text-gray-600" },
  sent: { label: "Terkirim", cls: "bg-blue-100 text-blue-800" },
  delivered: { label: "Sampai", cls: "bg-green-100 text-green-800" },
  failed: { label: "Gagal", cls: "bg-red-100 text-red-800" },
  cancelled: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-400" },
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: allInvoices }, { data: recentMessages }] = await Promise.all([
    supabase
      .from("invoices")
      .select("status, amount, paid_amount, paid_at, created_at"),
    supabase
      .from("messages")
      .select("id, to_phone, body, status, scheduled_at, sent_at, error_detail, invoices(invoice_number, contacts(name))")
      .order("scheduled_at", { ascending: false })
      .limit(30),
  ]);

  const invoices = allInvoices ?? [];
  const totalCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.paid_amount ?? i.amount), 0);

  const decided = invoices.filter((i) => i.status === "paid" || i.status === "cancelled" || i.status === "overdue");
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const successRate = decided.length > 0 ? Math.round((paidCount / decided.length) * 100) : null;

  // Breakdown 6 bulan terakhir berdasarkan tanggal lunas
  const now = new Date();
  const months: { key: string; label: string; collected: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      collected: 0,
      count: 0,
    });
  }
  for (const inv of invoices) {
    if (inv.status !== "paid" || !inv.paid_at) continue;
    const d = new Date(inv.paid_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) {
      bucket.collected += Number(inv.paid_amount ?? inv.amount);
      bucket.count += 1;
    }
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: msgStats } = await supabase
    .from("messages")
    .select("status")
    .gte("scheduled_at", monthStart);
  const sentThisMonth = (msgStats ?? []).filter((m) => m.status === "sent" || m.status === "delivered").length;
  const failedThisMonth = (msgStats ?? []).filter((m) => m.status === "failed").length;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Laporan</h1>
      <p className="mt-1 text-sm text-gray-500">
        Bukti hasil kerja pengingat otomatis Anda.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Total Tertagih Sepanjang Waktu</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatRupiah(totalCollected)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Tingkat Keberhasilan Tagih</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {successRate === null ? "—" : `${successRate}%`}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Pengingat Terkirim Bulan Ini</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{sentThisMonth}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Pengingat Gagal Bulan Ini</p>
          <p className={`mt-1 text-xl font-bold ${failedThisMonth > 0 ? "text-red-600" : "text-gray-900"}`}>
            {failedThisMonth}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Tertagih per Bulan (6 Bulan Terakhir)</h2>
        <div className="mt-4 space-y-2">
          {months.every((m) => m.collected === 0) ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Belum ada pembayaran tercatat dalam 6 bulan terakhir.
            </p>
          ) : (
            months.map((m) => {
              const max = Math.max(...months.map((x) => x.collected), 1);
              const widthPct = Math.max((m.collected / max) * 100, m.collected > 0 ? 4 : 0);
              return (
                <div key={m.key} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0 text-gray-500">{m.label}</span>
                  <div className="h-6 flex-1 rounded bg-gray-100">
                    <div
                      className="h-6 rounded bg-blue-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-32 shrink-0 text-right font-medium text-gray-900">
                    {formatRupiah(m.collected)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Riwayat Pengingat Terkirim</h2>
        <p className="mt-1 text-xs text-gray-400">30 pengingat terjadwal terbaru.</p>

        {!recentMessages || recentMessages.length === 0 ? (
          <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Belum ada pengingat yang terjadwal. Setelah Anda menambah tagihan,
            pengingat otomatis akan muncul di sini.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="py-2 pr-4">Pelanggan</th>
                  <th className="py-2 pr-4">Invoice</th>
                  <th className="py-2 pr-4">Jadwal</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((m) => {
                  const inv = m.invoices as unknown as {
                    invoice_number: string;
                    contacts: { name: string } | null;
                  } | null;
                  const badge = MESSAGE_STATUS_BADGE[m.status] ?? MESSAGE_STATUS_BADGE.queued;
                  return (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-gray-900">{inv?.contacts?.name ?? "-"}</p>
                        <p className="text-xs text-gray-400">{m.to_phone}</p>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{inv?.invoice_number ?? "-"}</td>
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(m.sent_at ?? m.scheduled_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {m.status === "failed" && m.error_detail && (
                          <p className="mt-0.5 text-xs text-red-500">{m.error_detail}</p>
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
