import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";
import { markInvoicePaid, cancelInvoice } from "./actions";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum Dibayar" },
  { key: "overdue", label: "Lewat Tempo" },
  { key: "paid", label: "Lunas" },
  { key: "cancelled", label: "Dibatalkan" },
] as const;

const BADGE: Record<string, { label: string; cls: string }> = {
  unpaid: { label: "Belum dibayar", cls: "bg-yellow-100 text-yellow-800" },
  overdue: { label: "Lewat tempo", cls: "bg-red-100 text-red-800" },
  paid: { label: "Lunas", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-500" },
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; success?: string }>;
}) {
  const { status = "all", success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("invoices")
    .select("id, invoice_number, amount, due_date, status, description, contacts(name, phone)")
    .order("due_date", { ascending: true })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);

  const { data: invoices } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tagihan</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/invoices/import"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Import Excel/CSV
          </Link>
          <Link
            href="/dashboard/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah Tagihan
          </Link>
        </div>
      </div>

      {success && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Tagihan berhasil dibuat. Pengingat WA akan dijadwalkan otomatis sesuai
          jadwal Anda (H-3, hari H, H+3, H+7).
        </div>
      )}

      <div className="mt-4 flex gap-1 overflow-x-auto">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/dashboard/invoices" : `/dashboard/invoices?status=${f.key}`}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
              status === f.key
                ? "bg-gray-900 font-medium text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        {!invoices || invoices.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {status === "all"
              ? "Belum ada tagihan. Klik “+ Tambah Tagihan” untuk mulai."
              : "Tidak ada tagihan dengan status ini."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Jatuh Tempo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const contact = inv.contacts as unknown as { name: string; phone: string } | null;
                const badge = BADGE[inv.status] ?? BADGE.unpaid;
                const actionable = inv.status === "unpaid" || inv.status === "overdue";
                return (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{contact?.name ?? "-"}</p>
                      <p className="text-xs text-gray-400">{contact?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.invoice_number}
                      {inv.description && (
                        <p className="text-xs text-gray-400">{inv.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatRupiah(Number(inv.amount))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(inv.due_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {actionable && (
                        <div className="flex justify-end gap-2">
                          <form action={markInvoicePaid}>
                            <input type="hidden" name="id" value={inv.id} />
                            <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                              ✓ Lunas
                            </button>
                          </form>
                          <form action={cancelInvoice}>
                            <input type="hidden" name="id" value={inv.id} />
                            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100">
                              Batalkan
                            </button>
                          </form>
                        </div>
                      )}
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
