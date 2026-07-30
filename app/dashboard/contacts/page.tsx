import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createContact } from "../invoices/actions";

export default async function ContactsPage({
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
    .select("id, name, phone, created_at")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Pelanggan</h1>

      <form
        action={createContact}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm"
      >
        <label className="block">
          <span className="text-xs font-medium text-gray-700">Nama</span>
          <input
            name="name"
            required
            placeholder="Nama pelanggan"
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-700">No. WA</span>
          <input
            name="phone"
            required
            placeholder="0812xxxxxxxx"
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          + Tambah
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        {!contacts || contacts.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Belum ada pelanggan. Tambahkan lewat form di atas, atau otomatis
            terbuat saat Anda membuat tagihan baru.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">No. WA</th>
                <th className="px-4 py-3">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
