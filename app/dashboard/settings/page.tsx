import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connectDevice, recheckDevice, disconnectDevice } from "./actions";

export default async function SettingsPage({
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

  const { data: devices } = await supabase
    .from("wa_devices")
    .select("id, phone_number, status, last_checked_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold text-gray-900">Perangkat WhatsApp</h1>
      <p className="mt-1 text-sm text-gray-500">
        Hubungkan nomor WA yang akan mengirim pengingat tagihan secara otomatis.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</div>
      )}

      {devices && devices.length > 0 && (
        <div className="mt-6 space-y-3">
          {devices.map((d) => (
            <div key={d.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{d.phone_number}</p>
                  <p className="text-xs text-gray-400">
                    Terakhir dicek:{" "}
                    {d.last_checked_at
                      ? new Date(d.last_checked_at).toLocaleString("id-ID")
                      : "belum pernah"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    d.status === "connected"
                      ? "bg-green-100 text-green-800"
                      : d.status === "banned"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {d.status === "connected"
                    ? "Tersambung"
                    : d.status === "banned"
                    ? "Diblokir"
                    : "Terputus"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <form action={recheckDevice}>
                  <input type="hidden" name="id" value={d.id} />
                  <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Cek Ulang Status
                  </button>
                </form>
                <form action={disconnectDevice}>
                  <input type="hidden" name="id" value={d.id} />
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">
          {devices && devices.length > 0 ? "Tambah Perangkat Lain" : "Hubungkan Nomor WA"}
        </h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-600">
          <li>
            Buka{" "}
            <a
              href="https://md.fonnte.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              dashboard Fonnte
            </a>
            , tambah device baru, lalu scan QR dengan WhatsApp yang mau dipakai jualan.
          </li>
          <li>Setelah tersambung, buka menu Device, salin token device tersebut.</li>
          <li>Tempel token di bawah ini.</li>
        </ol>

        <form action={connectDevice} className="mt-4 space-y-3">
          <input
            name="token"
            required
            placeholder="Tempel token device Fonnte di sini"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Sambungkan
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-400">
          Token disimpan aman dan hanya dipakai sistem untuk mengirim pengingat
          atas nama Anda.
        </p>
      </div>
    </div>
  );
}
