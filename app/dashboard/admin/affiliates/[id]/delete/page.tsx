import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteAffiliate } from "../../actions";

export default async function DeleteAffiliatePage({
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
  const [{ data: affiliate }, { count: commissionCount }, { count: referredCount }] = await Promise.all([
    admin.from("affiliates").select("id, code, name, email").eq("id", id).maybeSingle(),
    admin.from("affiliate_commissions").select("id", { count: "exact", head: true }).eq("affiliate_id", id),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", id),
  ]);

  if (!affiliate) notFound();

  const blocked = (commissionCount ?? 0) > 0 || (referredCount ?? 0) > 0;

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard/admin/affiliates" className="text-sm text-gray-500 hover:text-gray-900">
        ← Kembali ke Kelola Affiliate
      </Link>

      <div className={`mt-4 rounded-xl border-2 p-6 ${blocked ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
        <h1 className={`text-lg font-bold ${blocked ? "text-amber-700" : "text-red-700"}`}>
          {blocked ? "Tidak Bisa Dihapus" : "Hapus Affiliate?"}
        </h1>

        {blocked ? (
          <>
            <p className="mt-2 text-sm text-amber-900">
              <strong>{affiliate.name}</strong> ({affiliate.email}) punya riwayat yang tidak boleh hilang:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-amber-900">
              {(commissionCount ?? 0) > 0 && <li>• {commissionCount} riwayat komisi tercatat</li>}
              {(referredCount ?? 0) > 0 && <li>• {referredCount} pelanggan yang direferensikan olehnya</li>}
            </ul>
            <p className="mt-3 text-sm text-amber-900">
              Menghapus affiliate ini akan merusak riwayat keuangan & atribusi referral. Gunakan tombol{" "}
              <strong>Nonaktifkan</strong> di halaman Kelola Affiliate sebagai gantinya — itu menghentikan komisi
              baru tanpa menghapus riwayat.
            </p>
            <Link
              href="/dashboard/admin/affiliates"
              className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-red-900">
              Anda akan menghapus affiliate <strong>{affiliate.name}</strong> ({affiliate.email}, kode{" "}
              <span className="font-mono">{affiliate.code}</span>) secara permanen. Affiliate ini belum punya
              riwayat komisi atau referral, jadi aman dihapus. Tindakan ini <strong>tidak bisa dibatalkan</strong>.
            </p>
            <form action={deleteAffiliate} className="mt-6 flex items-center gap-3">
              <input type="hidden" name="id" value={affiliate.id} />
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Ya, Hapus Permanen
              </button>
              <Link
                href="/dashboard/admin/affiliates"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
