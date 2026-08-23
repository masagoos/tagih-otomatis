import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateAffiliate } from "../../actions";

export default async function EditAffiliatePage({
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
  if (user.email !== process.env.FOUNDER_EMAIL) redirect("/dashboard");

  const admin = createAdminClient();
  const { data: affiliate } = await admin
    .from("affiliates")
    .select("id, code, name, email, phone, tier, status")
    .eq("id", id)
    .maybeSingle();

  if (!affiliate) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/admin/affiliates" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke Kelola Affiliate
      </Link>
      <h1 className="mt-2 text-xl font-bold text-gray-900">Ubah Data Affiliate</h1>
      <p className="mt-1 text-sm text-gray-500 font-mono">?ref={affiliate.code}</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form action={updateAffiliate} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={affiliate.id} />

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nama</span>
          <input
            name="name"
            defaultValue={affiliate.name}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            defaultValue={affiliate.email}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">No. WhatsApp (opsional)</span>
          <input
            name="phone"
            defaultValue={affiliate.phone ?? ""}
            placeholder="0812xxxxxxxx"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Tingkatan</span>
            <select
              name="tier"
              defaultValue={affiliate.tier}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="affiliate">Affiliate (30%)</option>
              <option value="perak">Perak (35%)</option>
              <option value="emas">Emas (40%)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              name="status"
              defaultValue={affiliate.status}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Simpan Perubahan
          </button>
          <Link href="/dashboard/admin/affiliates" className="text-sm text-gray-500 hover:text-gray-900">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
