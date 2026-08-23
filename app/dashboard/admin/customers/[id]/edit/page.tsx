import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateCustomer } from "../../actions";

export default async function EditCustomerPage({
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
  const { data: customer } = await admin
    .from("profiles")
    .select("id, business_name, owner_name, phone, plan, sub_status, plan_expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  const planExpiresValue = customer.plan_expires_at
    ? new Date(customer.plan_expires_at).toISOString().slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/admin/customers" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke Kelola Pelanggan
      </Link>
      <h1 className="mt-2 text-xl font-bold text-gray-900">Ubah Data Pelanggan</h1>
      <p className="mt-1 text-sm text-gray-500">{customer.business_name}</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form action={updateCustomer} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={customer.id} />

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nama Usaha</span>
          <input
            name="business_name"
            defaultValue={customer.business_name}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nama Pemilik</span>
          <input
            name="owner_name"
            defaultValue={customer.owner_name}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">No. WhatsApp</span>
          <input
            name="phone"
            defaultValue={customer.phone}
            required
            placeholder="0812xxxxxxxx"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Paket</span>
            <select
              name="plan"
              defaultValue={customer.plan}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="trial">Uji Coba</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status Langganan</span>
            <select
              name="sub_status"
              defaultValue={customer.sub_status}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="active">Aktif</option>
              <option value="past_due">Telat Bayar</option>
              <option value="suspended">Ditangguhkan</option>
              <option value="cancelled">Berhenti</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Paket Berlaku Sampai</span>
          <input
            type="date"
            name="plan_expires_at"
            defaultValue={planExpiresValue}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-gray-400">Kosongkan kalau paket Uji Coba / belum ada batas.</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Simpan Perubahan
          </button>
          <Link href="/dashboard/admin/customers" className="text-sm text-gray-500 hover:text-gray-900">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
