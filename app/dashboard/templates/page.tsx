import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTemplate, updateRule } from "./actions";

function offsetLabel(offset: number): string {
  if (offset < 0) return `H${offset} (${Math.abs(offset)} hari sebelum jatuh tempo)`;
  if (offset === 0) return "Hari H (jatuh tempo)";
  return `H+${offset} (${offset} hari setelah jatuh tempo)`;
}

const VARS = [
  { tag: "{{nama}}", desc: "nama pelanggan" },
  { tag: "{{jumlah}}", desc: "nominal tagihan" },
  { tag: "{{jatuh_tempo}}", desc: "tanggal jatuh tempo" },
  { tag: "{{invoice}}", desc: "nomor invoice" },
  { tag: "{{usaha}}", desc: "nama usaha Anda" },
];

export default async function TemplatesPage({
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

  const { data: rules } = await supabase
    .from("reminder_rules")
    .select("id, offset_days, send_hour, is_active, message_templates(id, name, body)")
    .order("offset_days", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Template & Jadwal Pengingat</h1>
      <p className="mt-1 text-sm text-gray-500">
        Atur bunyi pesan dan kapan pengingat dikirim otomatis via WhatsApp.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</div>
      )}

      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
        <p className="font-medium">Variabel yang bisa dipakai di pesan:</p>
        <p className="mt-1">
          {VARS.map((v) => (
            <span key={v.tag} className="mr-3">
              <code className="rounded bg-white px-1.5 py-0.5">{v.tag}</code> {v.desc}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {!rules || rules.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Belum ada jadwal pengingat.
          </div>
        ) : (
          rules.map((rule) => {
            const tpl = rule.message_templates as unknown as {
              id: string;
              name: string;
              body: string;
            } | null;
            if (!tpl) return null;
            return (
              <div key={rule.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    {offsetLabel(rule.offset_days)}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      rule.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {rule.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <form action={updateTemplate} className="mt-3 space-y-2">
                  <input type="hidden" name="id" value={tpl.id} />
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500">Nama template</span>
                    <input
                      name="name"
                      defaultValue={tpl.name}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500">Isi pesan</span>
                    <textarea
                      name="body"
                      defaultValue={tpl.body}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">
                    Simpan Pesan
                  </button>
                </form>

                <form
                  action={updateRule}
                  className="mt-4 flex flex-wrap items-center gap-3 border-t pt-3"
                >
                  <input type="hidden" name="id" value={rule.id} />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    Kirim jam
                    <select
                      name="send_hour"
                      defaultValue={rule.send_hour}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={rule.is_active}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Aktifkan pengingat ini
                  </label>
                  <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Simpan Jadwal
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
