import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";

export const metadata = {
  title: "Tagih Otomatis — Pengingat Tagihan WhatsApp untuk UMKM",
  description:
    "Catat tagihan sekali, sistem otomatis kirim pengingat ke WhatsApp pelanggan Anda. Berhenti nagih manual — mulai gratis 14 hari.",
};

const TIER_META: Record<string, { name: string; price: number; highlight?: boolean }> = {
  starter: { name: "Starter", price: 75000 },
  pro: { name: "Pro", price: 150000, highlight: true },
};

const TECH_PARTNERS = ["WhatsApp via Fonnte", "Mayar", "Supabase", "Vercel"];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: limits } = await supabase
    .from("plan_limits")
    .select("plan, monthly_messages, max_devices");
  const limitsByPlan = new Map((limits ?? []).map((l) => [l.plan, l]));

  return (
    <main className="bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
              ✓
            </span>
            Tagih Otomatis
          </span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 sm:flex">
            <a href="#cara-kerja" className="hover:text-gray-900">Cara Kerja</a>
            <a href="#fitur" className="hover:text-gray-900">Fitur</a>
            <a href="#harga" className="hover:text-gray-900">Harga</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </nav>
          <Link
            href="/login"
            className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700"
          >
            Coba Gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, #ede9fe 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
          {/* Kiri: copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
              🤖 Otomatisasi Tagihan untuk UMKM
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
              Catat. Jadwalkan.
              <br />
              <span className="text-violet-600">Biar WhatsApp yang Nagih.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-gray-500 sm:text-lg">
              Tagih Otomatis mengirim pengingat pembayaran ke WhatsApp
              pelanggan Anda secara otomatis — dari sebelum jatuh tempo
              sampai lunas. Anda tinggal pantau laporannya.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                Coba Gratis 14 Hari →
              </Link>
              <a
                href="#cara-kerja"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200">▶</span>
                Lihat cara kerjanya
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
              <span>✓ Tanpa kartu kredit</span>
              <span>✓ Setup 10 menit</span>
              <span>✓ Batalkan kapan saja</span>
            </div>
          </div>

          {/* Kanan: mockup WhatsApp + kartu statistik melayang */}
          <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[3rem] opacity-70 blur-2xl"
              style={{ background: "radial-gradient(circle, #ddd6fe 0%, transparent 70%)" }}
            />
            {/* "Layar HP" berisi mockup chat WA */}
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-violet-100">
              <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm text-white">
                  🏪
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Toko Bu Sari</p>
                  <p className="text-[11px] text-white/70">online</p>
                </div>
              </div>
              <div className="space-y-2 bg-[#e5ddd5] px-3 py-4">
                <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#dcf8c6] px-3 py-2 text-[12px] leading-snug text-gray-800 shadow-sm">
                  Halo Kak Budi, tagihan INV-0012 sebesar Rp350.000 jatuh
                  tempo 3 hari lagi. Mohon disiapkan ya 🙏
                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-gray-500">
                    09.00 <span className="text-sky-500">✓✓</span>
                  </div>
                </div>
                <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#dcf8c6] px-3 py-2 text-[12px] leading-snug text-gray-800 shadow-sm">
                  Halo Kak Budi, tagihan INV-0012 sudah jatuh tempo hari ini.
                  Konfirmasi kalau sudah dibayar ya 🙏
                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-gray-500">
                    09.00 <span className="text-sky-500">✓✓</span>
                  </div>
                </div>
                <div className="mx-auto w-fit rounded-full bg-white/70 px-3 py-1 text-[10px] text-gray-500">
                  Sent via Tagih Otomatis
                </div>
              </div>
            </div>

            {/* Kartu melayang: kemampuan produk, BUKAN klaim jumlah pengguna */}
            <div className="absolute -left-10 top-8 hidden w-40 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl sm:block">
              <p className="text-lg font-extrabold text-violet-600">4x</p>
              <p className="text-[11px] leading-snug text-gray-500">Pengingat terjadwal: H-3 s/d H+7</p>
            </div>
            <div className="absolute -right-6 top-1/3 hidden w-36 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl sm:block">
              <p className="text-lg font-extrabold text-violet-600">24 Jam</p>
              <p className="text-[11px] leading-snug text-gray-500">Berjalan otomatis, tanpa perlu Anda pantau</p>
            </div>
            <div className="absolute -bottom-6 left-6 hidden w-40 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl sm:block">
              <p className="text-lg font-extrabold text-violet-600">10 Menit</p>
              <p className="text-[11px] leading-snug text-gray-500">Setup awal sampai siap kirim</p>
            </div>
          </div>
        </div>

        {/* Strip teknologi terintegrasi */}
        <div className="mx-auto max-w-5xl px-5 pb-16">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-6 py-5">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-gray-400">
              Terintegrasi dengan teknologi tepercaya
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {TECH_PARTNERS.map((name) => (
                <span key={name} className="text-sm font-semibold text-gray-400">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Masalah */}
      <section className="border-t border-gray-100 bg-gray-50/60 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Masalahnya</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              UMKM kehilangan uang bukan karena kurang laris
              <br className="hidden sm:block" /> — tapi karena lupa nagih.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                emoji: "😓",
                title: "Sungkan Ingetin Berkali-kali",
                desc: "Menagih pelanggan yang sama berulang kali bikin tidak enak hati — padahal itu uang Anda sendiri.",
              },
              {
                emoji: "📝",
                title: "Catatan Tagihan Berantakan",
                desc: "Tersebar di buku, chat WA pribadi, atau ingatan — susah tahu siapa yang belum bayar dan sejak kapan.",
              },
              {
                emoji: "💸",
                title: "Uang Macet, Cash Flow Seret",
                desc: "Tagihan yang telat ditagih artinya uang yang telat masuk — usaha jadi susah berkembang.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm shadow-gray-100">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                  {item.emoji}
                </span>
                <h3 className="mt-4 font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Simpel</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Cara Kerjanya</h2>
          </div>
          <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent sm:block"
            />
            {[
              {
                step: "1",
                title: "Catat Tagihan",
                desc: "Input nama pelanggan, nominal, dan tanggal jatuh tempo — 30 detik selesai.",
              },
              {
                step: "2",
                title: "Sistem Jadwalkan Otomatis",
                desc: "Pengingat WA terjadwal otomatis: sebelum jatuh tempo, hari-H, sampai kalau telat — bahasa sopan, bukan spam.",
              },
              {
                step: "3",
                title: "Anda Tinggal Lihat Laporan",
                desc: "Pantau siapa sudah bayar, siapa belum, dan berapa total tertagih — semua di satu dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-base font-bold text-white shadow-lg shadow-violet-200">
                  {item.step}
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="border-t border-gray-100 bg-gray-50/60 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Fitur</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Semua yang Anda Butuh</h2>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-10 text-center sm:grid-cols-3 lg:grid-cols-6">
            {[
              { emoji: "📱", title: "Pengingat Otomatis", desc: "H-3 s/d H+7." },
              { emoji: "📊", title: "Laporan Real-time", desc: "Tahu berapa tertagih." },
              { emoji: "📥", title: "Import Excel/CSV", desc: "Upload sekali langkah." },
              { emoji: "✍️", title: "Template Bisa Diedit", desc: "Sesuai gaya usaha." },
              { emoji: "🔒", title: "Data Terenkripsi", desc: "Aman & privat." },
              { emoji: "⏰", title: "Jadwal Fleksibel", desc: "Atur jam kirim." },
            ].map((item) => (
              <div key={item.title}>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                  {item.emoji}
                </span>
                <h3 className="mt-3 text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase — mockup dashboard sungguhan */}
      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Di Dalam Aplikasi</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Satu dashboard, semua tagihan terpantau.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {[
                "Lihat total piutang & tertagih bulan ini sekali buka.",
                "Riwayat tiap pengingat: terkirim, sampai, atau gagal.",
                "Tandai lunas satu klik — pengingat berikutnya otomatis berhenti.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] text-violet-700">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup kartu dashboard */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl shadow-violet-100">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-violet-50 p-3">
                <p className="text-[11px] text-gray-500">Tertagih Bulan Ini</p>
                <p className="mt-1 text-lg font-extrabold text-violet-700">Rp4.250.000</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Belum Dibayar</p>
                <p className="mt-1 text-lg font-extrabold text-gray-900">6</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { name: "Toko Berkah Jaya", amount: "Rp750.000", status: "Lunas", cls: "bg-green-100 text-green-700" },
                { name: "Warung Melati", amount: "Rp350.000", status: "Terkirim", cls: "bg-blue-100 text-blue-700" },
                { name: "Bu Rina Catering", amount: "Rp1.200.000", status: "Menunggu", cls: "bg-yellow-100 text-yellow-700" },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <span className="font-medium text-gray-700">{row.name}</span>
                  <span className="text-gray-500">{row.amount}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${row.cls}`}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="border-t border-gray-100 bg-gray-50/60 px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Harga</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Harga Sederhana</h2>
            <p className="mt-2 text-sm text-gray-500">
              Coba gratis 14 hari dulu. Bayar per bulan, berhenti kapan saja.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Object.entries(TIER_META).map(([key, tier]) => {
              const limit = limitsByPlan.get(key);
              return (
                <div
                  key={key}
                  className={`relative rounded-2xl p-7 ${
                    tier.highlight
                      ? "border-2 border-violet-600 bg-white shadow-xl shadow-violet-100"
                      : "border border-gray-200 bg-white"
                  }`}
                >
                  {tier.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-semibold text-white">
                      Paling Populer
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-3xl font-extrabold text-gray-900">
                    {formatRupiah(tier.price)}
                    <span className="text-sm font-normal text-gray-400">/bulan</span>
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-violet-600">✓</span>
                      {limit?.monthly_messages ?? "—"} pesan pengingat/bulan
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-violet-600">✓</span>
                      {limit?.max_devices ?? 1} nomor WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-violet-600">✓</span>
                      Tagihan &amp; pelanggan tanpa batas
                    </li>
                  </ul>
                  <Link
                    href="/login"
                    className={`mt-6 block rounded-full py-3 text-center text-sm font-semibold ${
                      tier.highlight
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    Mulai Coba Gratis
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">FAQ</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Pertanyaan Umum</h2>
          </div>
          <div className="mt-10 divide-y divide-gray-100">
            {[
              {
                q: "Apakah nomor WhatsApp saya bisa kena blokir?",
                a: "Kami mengirim dengan jeda otomatis antar pesan dan hanya ke nomor pelanggan yang memang punya tagihan dengan usaha Anda — bukan kirim pesan massal ke daftar nomor asing.",
              },
              {
                q: "Data pelanggan saya aman?",
                a: "Ya. Data tersimpan terenkripsi dan hanya bisa diakses dari akun Anda sendiri. Selengkapnya di Kebijakan Privasi kami.",
              },
              {
                q: "Perlu WhatsApp Business?",
                a: "Tidak wajib. Anda bisa hubungkan nomor WhatsApp biasa yang sudah Anda pakai untuk jualan.",
              },
              {
                q: "Bagaimana kalau saya mau berhenti?",
                a: "Tidak ada kontrak mengikat. Bayar per bulan, dan bisa berhenti kapan saja tanpa penalti.",
              },
            ].map((item) => (
              <div key={item.q} className="py-5">
                <h3 className="font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA akhir */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-violet-600 px-8 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            🚀
          </span>
          <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
            Berhenti nagih manual, mulai hari ini.
          </h2>
          <p className="mt-2 text-sm text-violet-100">
            Jadi salah satu pengguna pertama kami — early-bird, langsung didampingi setup.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-violet-700 shadow-lg hover:bg-violet-50"
          >
            Coba Gratis 14 Hari →
          </Link>
          <p className="mt-4 text-xs text-violet-200">Tanpa kartu kredit · Setup 10 menit</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-gray-400 sm:flex-row">
          <span>© 2026 Tagih Otomatis</span>
          <div className="flex gap-4">
            <Link href="/syarat-layanan" className="hover:text-gray-600">Syarat Layanan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-gray-600">Kebijakan Privasi</Link>
            <Link href="/kebijakan-refund" className="hover:text-gray-600">Kebijakan Refund</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
