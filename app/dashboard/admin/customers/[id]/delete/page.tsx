import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteCustomer } from "../../actions";

export default async function DeleteCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.email !== process.env.FOUNDER_EMAIL) redirect("/dashboard");

  const admin = createAdminClient();
  const [{ data: customer }, { data: payments }, { data: invoices }] = await Promise.all([
    admin.from("profiles").select("id, business_name, owner_name, plan, created_at").eq("id", id).maybeSingle(),
    admin.from("payments").select("id").eq("user_id", id).eq("status", "paid"),
    admin.from("invoices").select("id").eq("user_id", id),
  ]);

  if (!customer) notFound();

  const hasPaidHistory = (payments?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard/admin/customers" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke Kelola Pelanggan
      </Link>

      <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-bold text-red-700">Hapus Pelanggan?</h1>
        <p className="mt-2 text-sm text-red-900">
          Anda akan menghapus <strong>{customer.business_name}</strong> ({customer.owner_name}) secara permanen —
          termasuk seluruh tagihan, kontak pelanggan, template pesan, riwayat pengingat, riwayat pembayaran, dan
          perangkat WA yang terhubung. Tindakan ini <strong>tidak bisa dibatalkan</strong>.
        </p>

        <ul className="mt-4 space-y-1 text-sm text-red-900">
          <li>• {invoices?.length ?? 0} tagihan akan ikut terhapus</li>
          <li>• Terdaftar sejak {new Date(customer.created_at).toLocaleDateString("id-ID")}</li>
        </ul>

        {hasPaidHistory && (
          <div className="mt-4 rounded-lg bg-white p-3 text-sm text-red-800">
            ⚠️ Pelanggan ini punya <strong>riwayat pembayaran lunas</strong>. Pertimbangkan untuk mengarsipkan
            datanya sendiri (screenshot/ekspor) sebelum menghapus, untuk kebutuhan pembukuan.
          </div>
        )}

        <form action={deleteCustomer} className="mt-6 flex items-center gap-3">
          <input type="hidden" name="id" value={customer.id} />
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Ya, Hapus Permanen
          </button>
          <Link
            href="/dashboard/admin/customers"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link>
        </form>
      </div>
    </div>
  );
}
