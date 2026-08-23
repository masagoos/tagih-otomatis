import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateContact } from "../../actions";

export default async function EditContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contact } = await supabase
    .from("contacts")
    .select("id, name, phone, email")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!contact) notFound();

  return (
    <div className="mx-auto max-w-md">
      <Link href="/dashboard/contacts" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke Pelanggan
      </Link>
      <h1 className="mt-2 text-xl font-bold text-gray-900">Ubah Pelanggan</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form action={updateContact} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={contact.id} />

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nama</span>
          <input
            name="name"
            defaultValue={contact.name}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">No. WA</span>
          <input
            name="phone"
            defaultValue={contact.phone}
            required
            placeholder="0812xxxxxxxx"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email (opsional)</span>
          <input
            type="email"
            name="email"
            defaultValue={contact.email ?? ""}
            placeholder="nama@email.com"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Simpan Perubahan
          </button>
          <Link href="/dashboard/contacts" className="text-sm text-gray-500 hover:text-gray-900">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
