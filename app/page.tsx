import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";

export const metadata = {
  title: "Tagih Otomatis — Pengingat Tagihan WhatsApp untuk UMKM",
  description:
    "Catat tagihan sekali, sistem otomatis kirim pengingat ke WhatsApp pelanggan Anda. Berhenti nagih manual — mulai gratis 14 hari.",
};

const TIER_META: Record<string, { name: string; price: number }> = {
  starter: { name: "Starter", price: 75000 },
  pro: { name: "Pro", price: 150000 },
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: limits } = await supabase
    .from("plan_limits")
    .select("plan, monthly_messages, max_devices");
  const limitsByPlan = new Map((limits ?? []).map((l) => [l.plan, l]));

  return (
    <main className="bg-white text-gray-900">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold">Tagih Otomatis</span>
          <div className="flex items-center gap-4">
            <a href="#harga" className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline">
              Harga
            </a>
            <a href="#faq" className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline">
              FAQ
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Masuk / Coba Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          🚀 Baru diluncurkan — jadi salah satu pengguna pertama kami
        </span>
        <h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Capek Nagih Manual?
          <br />
          Biar WhatsApp yang Ingetin Pelanggan Anda.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg">
          Catat tagihan sekali, sistem otomatis kirim pengingat ke WhatsApp
          pelanggan — dari sebelum jatuh tempo sampai kalau telat bayar. Anda
          tinggal lihat laporan siapa yang sudah bayar.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700"
          >
            Coba Gratis 14 Hari
          </Link>
          <span className="text-xs text-gray-400">Tanpa kartu kredit. Setup 10 menit.</span>
        </div>
      </section>

      {/* Masalah */}
      <section className="border-t bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            UMKM sering kehilangan uang bukan karena kurang laris
            <br className="hidden sm:block" /> — tapi karena lupa nagih.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
              <div key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Cara Kerjanya</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
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
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="border-t bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Semua yang Anda Butuh</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "📱", title: "Pengingat WhatsApp Otomatis", desc: "Terjadwal H-3, hari-H, H+3, sampai H+7." },
              { emoji: "📊", title: "Laporan & Riwayat Pengingat", desc: "Tahu persis berapa yang tertagih dan pesan mana yang sudah terkirim." },
              { emoji: "📥", title: "Import dari Excel/CSV", desc: "Punya banyak tagihan sekaligus? Upload dalam satu langkah." },
              { emoji: "✍️", title: "Template Pesan Bisa Diedit", desc: "Sesuaikan bahasa pengingat sesuai gaya usaha Anda." },
              { emoji: "🔒", title: "Data Aman & Terenkripsi", desc: "Data tagihan dan pelanggan hanya bisa diakses akun Anda sendiri." },
              { emoji: "⏰", title: "Jadwal Jam Kirim Fleksibel", desc: "Atur jam kirim pengingat sesuai jam kerja yang sopan." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="mt-2 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Harga Sederhana</h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Coba gratis 14 hari dulu. Bayar per bulan, berhenti kapan saja.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {Object.entries(TIER_META).map(([key, tier]) => {
              const limit = limitsByPlan.get(key);
              return (
                <div key={key} className="rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatRupiah(tier.price)}
                    <span className="text-sm font-normal text-gray-400">/bulan</span>
                  </p>
                  <ul className="mt-4 space-y-1 text-sm text-gray-600">
                    <li>✓ {limit?.monthly_messages ?? "—"} pesan pengingat/bulan</li>
                    <li>✓ {limit?.max_devices ?? 1} nomor WhatsApp</li>
                    <li>✓ Tagihan &amp; pelanggan tanpa batas</li>
                  </ul>
                  <Link
                    href="/login"
                    className="mt-5 block rounded-lg bg-gray-900 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
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
      <section id="faq" className="border-t bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Pertanyaan Umum</h2>
          <div className="mt-8 space-y-6">
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
              <div key={item.q}>
                <h3 className="font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA akhir */}
      <section className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Berhenti nagih manual, mulai hari ini.
        </h2>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700"
        >
          Coba Gratis 14 Hari
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-gray-400 sm:flex-row">
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
