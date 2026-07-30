import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "../actions";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, phone")
    .eq("is_active", true)
    .order("name");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard/invoices" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke daftar tagihan
      </Link>
      <h1 className="mt-2 text-xl font-bold text-gray-900">Tambah Tagihan</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form action={createInvoice} className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Pelanggan</span>
          <select
            name="contact_id"
            defaultValue="new"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="new">— Pelanggan baru (isi di bawah) —</option>
            {contacts?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase text-gray-400">
            Jika pelanggan baru
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <input
              name="new_name"
              placeholder="Nama pelanggan"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="new_phone"
              placeholder="No. WA (0812xxxxxxxx)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nominal tagihan (Rp)</span>
          <input
            name="amount"
            required
            inputMode="numeric"
            placeholder="1.500.000"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Jatuh tempo</span>
          <input
            name="due_date"
            type="date"
            required
            min={today}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Keterangan <span className="text-gray-400">(opsional)</span>
          </span>
          <input
            name="description"
            placeholder="Katering 50 box, DP sudah 50%"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Simpan Tagihan
        </button>
        <p className="text-xs text-gray-400">
          Pengingat WA akan dijadwalkan otomatis: H-3, hari H, H+3, dan H+7
          (selama belum ditandai lunas).
        </p>
      </form>
    </div>
  );
}
