import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";
import { upgradePlan } from "./actions";

const PLAN_LABEL: Record<string, string> = { trial: "Uji Coba", starter: "Starter", pro: "Pro" };
const SUB_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-800" },
  past_due: { label: "Lewat Jatuh Tempo", cls: "bg-red-100 text-red-800" },
  suspended: { label: "Ditangguhkan", cls: "bg-red-100 text-red-800" },
  cancelled: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-500" },
};
const PAYMENT_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Menunggu Pembayaran", cls: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Lunas", cls: "bg-green-100 text-green-800" },
  expired: { label: "Kedaluwarsa", cls: "bg-gray-100 text-gray-500" },
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: limits }, { data: payments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, sub_status, trial_ends_at, plan_expires_at")
      .eq("id", user.id)
      .single(),
    supabase.from("plan_limits").select("plan, monthly_messages, max_devices"),
    supabase
      .from("payments")
      .select("id, plan, amount, status, created_at, paid_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const limitsByPlan = new Map((limits ?? []).map((l) => [l.plan, l]));
  const isTrialExpired =
    profile?.plan === "trial" && profile.trial_ends_at && new Date(profile.trial_ends_at) < new Date();

  const tiers: { key: "starter" | "pro"; name: string; price: number }[] = [
    { key: "starter", name: "Starter", price: 75000 },
    { key: "pro", name: "Pro", price: 150000 },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Langganan & Pembayaran</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Terima kasih! Kalau pembayaran sudah dikonfirmasi Mayar, paket Anda akan
          aktif dalam beberapa saat. Refresh halaman ini untuk melihat status terbaru.
        </div>
      )}

      <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Paket saat ini</p>
            <p className="text-lg font-bold text-gray-900">
              {PLAN_LABEL[profile?.plan ?? "trial"] ?? profile?.plan}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isTrialExpired
                ? "bg-red-100 text-red-800"
                : SUB_STATUS_LABEL[profile?.sub_status ?? "active"]?.cls ?? "bg-gray-100"
            }`}
          >
            {isTrialExpired ? "Uji Coba Berakhir" : SUB_STATUS_LABEL[profile?.sub_status ?? "active"]?.label}
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {profile?.plan === "trial" && profile.trial_ends_at
            ? `Uji coba ${isTrialExpired ? "berakhir pada" : "berakhir"} ${new Date(profile.trial_ends_at).toLocaleDateString("id-ID")}`
            : profile?.plan_expires_at
            ? `Aktif sampai ${new Date(profile.plan_expires_at).toLocaleDateString("id-ID")}`
            : ""}
        </p>
      </div>

      {isTrialExpired && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ Masa uji coba sudah berakhir. Pengingat otomatis berhenti terkirim
          sampai Anda memilih paket di bawah ini.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {tiers.map((tier) => {
          const limit = limitsByPlan.get(tier.key);
          const isCurrent = profile?.plan === tier.key && profile.sub_status === "active";
          return (
            <div key={tier.key} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-gray-900">{tier.name}</h2>
                {isCurrent && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    Paket Anda
                  </span>
                )}
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatRupiah(tier.price)}
                <span className="text-sm font-normal text-gray-400">/bulan</span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-gray-600">
                <li>✓ {limit?.monthly_messages ?? "?"} pesan pengingat/bulan</li>
                <li>✓ {limit?.max_devices ?? 1} nomor WA</li>
                <li>✓ Tagihan &amp; pelanggan tanpa batas</li>
              </ul>
              <form action={upgradePlan} className="mt-5">
                <input type="hidden" name="plan" value={tier.key} />
                <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  {isCurrent ? "Perpanjang Sekarang" : `Upgrade ke ${tier.name}`}
                </button>
              </form>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Pembayaran diproses oleh Mayar. Anda akan diarahkan ke halaman
        pembayaran resmi Mayar untuk menyelesaikan transaksi. Lihat{" "}
        <Link href="/kebijakan-refund" className="underline hover:text-gray-600">
          Kebijakan Refund
        </Link>{" "}
        kami.
      </p>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Riwayat Pembayaran</h2>
        {!payments || payments.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Belum ada riwayat pembayaran.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <tbody>
              {payments.map((p) => {
                const badge = PAYMENT_STATUS_LABEL[p.status] ?? PAYMENT_STATUS_LABEL.pending;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 capitalize text-gray-900">{p.plan}</td>
                    <td className="py-2 text-gray-500">{formatRupiah(Number(p.amount))}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(p.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-2">
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
