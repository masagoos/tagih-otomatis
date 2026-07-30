import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  unpaid: { label: "Belum dibayar", cls: "bg-yellow-100 text-yellow-800" },
  overdue: { label: "Lewat tempo", cls: "bg-red-100 text-red-800" },
  paid: { label: "Lunas", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-500" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: stats }, { data: recent }, { count: connectedDevices }] = await Promise.all([
    supabase.from("v_dashboard").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, due_date, status, contacts(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("wa_devices")
      .select("id", { count: "exact", head: true })
      .eq("status", "connected"),
  ]);

  const cards = [
    { label: "Belum Dibayar", value: String(stats?.unpaid_count ?? 0) },
    { label: "Lewat Jatuh Tempo", value: String(stats?.overdue_count ?? 0) },
    { label: "Total Piutang", value: formatRupiah(Number(stats?.outstanding_amount ?? 0)) },
    { label: "Tertagih Bulan Ini", value: formatRupiah(Number(stats?.collected_this_month ?? 0)) },
  ];

  return (
    <div>
      {(connectedDevices ?? 0) === 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <span>
            ⚠️ <strong>Pengingat otomatis belum aktif.</strong> Sambungkan nomor
            WA Anda supaya tagihan bisa ditagih otomatis ke pelanggan.
          </span>
          <Link
            href="/dashboard/settings"
            className="ml-4 shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Sambungkan Sekarang
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tagihan Terbaru</h2>
          <Link
            href="/dashboard/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah Tagihan
          </Link>
        </div>

        {!recent || recent.length === 0 ? (
          <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">
              Belum ada tagihan. Tambahkan tagihan pertama Anda — pengingat WA
              akan dijadwalkan otomatis.
            </p>
          </div>
        ) : (
          <table className="mt-4 w-full text-sm">
            <tbody>
              {recent.map((inv) => {
                const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.unpaid;
                return (
                  <tr key={inv.id} className="border-t">
                    <td className="py-3 font-medium text-gray-900">
                      {(inv.contacts as unknown as { name: string } | null)?.name ?? "-"}
                    </td>
                    <td className="py-3 text-gray-500">{inv.invoice_number}</td>
                    <td className="py-3 text-gray-900">{formatRupiah(Number(inv.amount))}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(inv.due_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
