import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PLAN_LABEL: Record<string, string> = {
  trial: "Uji Coba",
  starter: "Starter",
  pro: "Pro",
};

const SUB_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-800" },
  past_due: { label: "Telat Bayar", cls: "bg-amber-100 text-amber-800" },
  suspended: { label: "Ditangguhkan", cls: "bg-red-100 text-red-800" },
  cancelled: { label: "Berhenti", cls: "bg-gray-100 text-gray-500" },
};

const WA_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  connected: { label: "Tersambung", cls: "bg-green-100 text-green-800" },
  banned: { label: "Diblokir", cls: "bg-red-100 text-red-800" },
  disconnected: { label: "Terputus", cls: "bg-gray-100 text-gray-500" },
};

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.email !== process.env.FOUNDER_EMAIL) redirect("/dashboard");

  const admin = createAdminClient();

  const [{ data: profiles }, { data: devices }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, business_name, owner_name, phone, plan, sub_status, trial_ends_at, plan_expires_at, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("wa_devices")
      .select("user_id, phone_number, status, last_checked_at"),
  ]);

  const devicesByUser = new Map<string, typeof devices>();
  for (const d of devices ?? []) {
    const list = devicesByUser.get(d.user_id) ?? [];
    list.push(d);
    devicesByUser.set(d.user_id, list);
  }

  const now = new Date();
  const customerList = (profiles ?? []).map((p) => {
    const trialExpired = p.plan === "trial" && p.trial_ends_at && new Date(p.trial_ends_at) < now;
    const needsAttention = trialExpired || p.sub_status === "past_due" || p.sub_status === "suspended";
    return { ...p, needsAttention };
  });

  const totalCustomers = customerList.length;
  const activePaid = customerList.filter((c) => c.plan !== "trial" && c.sub_status === "active").length;
  const onTrial = customerList.filter((c) => c.plan === "trial").length;
  const needsAttentionCount = customerList.filter((c) => c.needsAttention).length;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Kelola Pelanggan</h1>
      <p className="mt-1 text-sm text-gray-500">
        Status langganan dan koneksi WhatsApp semua pelanggan.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Total Pelanggan</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{totalCustomers}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Berlangganan Aktif</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{activePaid}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Masih Uji Coba</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{onTrial}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Perlu Perhatian</p>
          <p className={`mt-1 text-xl font-bold ${needsAttentionCount > 0 ? "text-red-600" : "text-gray-900"}`}>
            {needsAttentionCount}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Semua Pelanggan</h2>
        {customerList.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Belum ada pelanggan terdaftar.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="py-2 pr-4">Usaha</th>
                  <th className="py-2 pr-4">Paket</th>
                  <th className="py-2 pr-4">Status Langganan</th>
                  <th className="py-2 pr-4">Berlaku / Berakhir</th>
                  <th className="py-2 pr-4">Nomor WA</th>
                  <th className="py-2 pr-4">Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {customerList.map((c) => {
                  const subBadge = SUB_STATUS_BADGE[c.sub_status] ?? SUB_STATUS_BADGE.active;
                  const customerDevices = devicesByUser.get(c.id) ?? [];
                  const dateLabel =
                    c.plan === "trial"
                      ? c.trial_ends_at
                        ? new Date(c.trial_ends_at).toLocaleDateString("id-ID")
                        : "-"
                      : c.plan_expires_at
                      ? new Date(c.plan_expires_at).toLocaleDateString("id-ID")
                      : "-";
                  return (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-gray-900">{c.business_name}</p>
                        <p className="text-xs text-gray-400">{c.owner_name} · {c.phone}</p>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{PLAN_LABEL[c.plan] ?? c.plan}</td>
                      <td className="py-2 pr-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${subBadge.cls}`}>
                          {subBadge.label}
                        </span>
                        {c.needsAttention && (
                          <span className="ml-1 text-xs font-medium text-red-600">⚠️</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{dateLabel}</td>
                      <td className="py-2 pr-4">
                        {customerDevices.length === 0 ? (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                            Belum ada
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {customerDevices.map((d) => {
                              const waBadge = WA_STATUS_BADGE[d.status] ?? WA_STATUS_BADGE.disconnected;
                              return (
                                <div key={d.phone_number} className="flex items-center gap-1.5">
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${waBadge.cls}`}>
                                    {waBadge.label}
                                  </span>
                                  <span className="text-xs text-gray-400">{d.phone_number}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
