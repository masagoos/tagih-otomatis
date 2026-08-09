import Link from "next/link";
import { formatRupiah } from "@/lib/phone";
import { submitAffiliateLead } from "./actions";

export const metadata = {
  title: "Program Affiliate — Tagih Otomatis",
  description:
    "Ajak pelaku UMKM pakai Tagih Otomatis, dapat komisi berulang setiap bulan selama pelanggan tetap aktif. Komisi mulai 30%, naik otomatis sampai 40%.",
};

const TIERS = [
  {
    name: "Affiliate",
    requirement: "Langsung aktif setelah didaftarkan",
    commission: 30,
    perks: ["Komisi berulang setiap bulan", "Link referral pribadi", "Naik tingkat otomatis"],
    highlight: false,
  },
  {
    name: "Affiliate Perak",
    requirement: "Minimal 5 pelanggan aktif hasil referral",
    commission: 35,
    perks: ["Semua benefit tingkat Affiliate", "Akses lebih awal ke fitur baru", "Materi promosi tambahan"],
    highlight: true,
  },
  {
    name: "Affiliate Emas",
    requirement: "Minimal 15 pelanggan aktif hasil referral",
    commission: 40,
    perks: [
      "Semua benefit tingkat Perak",
      "Bonus Rp500.000 tiap tambahan 10 pelanggan aktif baru/bulan",
      "Diakui sebagai Partner Resmi Tagih Otomatis",
    ],
    highlight: false,
  },
];

const EXAMPLES = [
  { plan: "Starter", price: 75000 },
  { plan: "Pro", price: 150000 },
];

export default async function AffiliatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <main className="bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
              ✓
            </span>
            Tagih Otomatis
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, #ede9fe 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
            🤝 Program Affiliate
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
            Rekomendasikan Tagih Otomatis,
            <br />
            <span className="text-violet-600">Dapat Komisi Setiap Bulan.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-gray-500 sm:text-lg">
            Cocok untuk pendamping UMKM, konsultan bisnis, atau siapa pun dengan
            jaringan pelaku UMKM. Komisi dibayar berulang — bukan cuma sekali —
            selama pelanggan yang Anda referensikan tetap aktif berlangganan.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#daftar"
              className="rounded-full bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              Daftar Jadi Affiliate →
            </a>
            <a
              href="#tingkatan"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Lihat skema komisi
            </a>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Pendaftaran diproses langsung oleh tim kami — Anda akan mendapat link referral pribadi lewat email dalam 1×24 jam.
          </p>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="border-t border-gray-100 bg-gray-50/60 px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Simpel</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Cara Kerjanya</h2>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              { step: "1", title: "Daftar", desc: "Kirim data diri lewat tombol di atas — kami proses manual, bukan robot, supaya Anda benar-benar terhubung dengan tim." },
              { step: "2", title: "Dapat Link Pribadi", desc: "Anda menerima link referral unik yang bisa dibagikan lewat WA, media sosial, atau komunitas Anda." },
              { step: "3", title: "Terima Komisi Bulanan", desc: "Setiap kali pelanggan hasil referral Anda membayar langganan, komisi otomatis tercatat dan dibayarkan." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-base font-bold text-white shadow-lg shadow-violet-200">
                  {item.step}
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tingkatan Komisi */}
      <section id="tingkatan" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Skema Komisi</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">3 Tingkatan Affiliate</h2>
            <p className="mt-2 text-sm text-gray-500">
              Naik tingkat otomatis begitu jumlah pelanggan aktif Anda bertambah — tidak perlu mendaftar ulang.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-7 ${
                  tier.highlight
                    ? "border-2 border-violet-600 bg-white shadow-xl shadow-violet-100"
                    : "border border-gray-200 bg-white"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-semibold text-white">
                    Paling Diminati
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-1 text-4xl font-extrabold text-violet-600">
                  {tier.commission}%
                  <span className="text-sm font-normal text-gray-400"> komisi/bulan</span>
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">Syarat</p>
                <p className="mt-1 text-sm text-gray-600">{tier.requirement}</p>
                <ul className="mt-5 space-y-2 text-sm text-gray-600">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className="mt-0.5 text-violet-600">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contoh Perhitungan */}
      <section className="border-t border-gray-100 bg-gray-50/60 px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Contoh Nyata</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Berapa Komisi yang Anda Terima?</h2>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[480px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm">
              <thead>
                <tr className="bg-violet-600 text-left text-white">
                  <th className="px-4 py-3 font-semibold">Paket Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">Affiliate (30%)</th>
                  <th className="px-4 py-3 font-semibold">Perak (35%)</th>
                  <th className="px-4 py-3 font-semibold">Emas (40%)</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((ex, i) => (
                  <tr key={ex.plan} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ex.plan} — {formatRupiah(ex.price)}/bulan
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatRupiah(Math.round(ex.price * 0.3))}/bulan</td>
                    <td className="px-4 py-3 text-gray-600">{formatRupiah(Math.round(ex.price * 0.35))}/bulan</td>
                    <td className="px-4 py-3 text-gray-600">{formatRupiah(Math.round(ex.price * 0.4))}/bulan</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">
            Komisi dihitung dari nilai langganan aktual per bulan, dibayarkan berulang selama pelanggan tersebut tetap berlangganan — bukan komisi sekali saja.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">FAQ</span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Pertanyaan Umum</h2>
          </div>
          <div className="mt-10 divide-y divide-gray-100">
            {[
              {
                q: "Berapa lama komisi terus dibayarkan?",
                a: "Selama pelanggan yang Anda referensikan tetap aktif berlangganan — bukan sekali bayar lalu selesai. Kalau pelanggan berhenti, komisi untuk pelanggan itu juga berhenti.",
              },
              {
                q: "Kapan komisi dibayarkan?",
                a: "Komisi dihitung otomatis setiap kali pelanggan referral Anda membayar, dan dibayarkan sesuai jadwal pencairan platform pembayaran yang kami pakai.",
              },
              {
                q: "Apakah ada biaya untuk jadi affiliate?",
                a: "Tidak ada. Pendaftaran dan keikutsertaan program ini sepenuhnya gratis.",
              },
              {
                q: "Bagaimana cara naik tingkat?",
                a: "Otomatis — begitu jumlah pelanggan aktif hasil referral Anda mencapai ambang tingkat berikutnya (5 untuk Perak, 15 untuk Emas), komisi Anda naik dengan sendirinya mulai bulan berikutnya.",
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

      {/* Form Pendaftaran */}
      <section id="daftar" className="px-5 pb-20">
        <div className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-violet-600 px-8 py-12">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              🤝
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
              Siap jadi partner kami?
            </h2>
            <p className="mt-2 text-sm text-violet-100">
              Isi data di bawah — tim kami akan menghubungi Anda dalam 1×24 jam.
            </p>
          </div>

          {success && (
            <div className="mt-6 rounded-xl bg-white/15 px-4 py-3 text-sm text-white">
              ✓ Terima kasih! Pendaftaran Anda sudah kami terima. Kami akan menghubungi lewat email dalam 1×24 jam.
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-xl bg-red-500/20 px-4 py-3 text-sm text-white">
              Pendaftaran gagal: {error === "data-tidak-lengkap" ? "Nama dan email wajib diisi dengan benar." : error}
            </div>
          )}

          <form action={submitAffiliateLead} className="mt-6 space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Nama lengkap"
              required
              className="w-full rounded-xl border-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="text"
              name="network"
              placeholder="Jaringan/komunitas (opsional)"
              className="w-full rounded-xl border-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="email"
              name="email"
              placeholder="Email aktif"
              required
              className="w-full rounded-xl border-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="text"
              name="phone"
              placeholder="No. WhatsApp (opsional, 0812xxxxxxxx)"
              className="w-full rounded-xl border-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-violet-700 shadow-lg hover:bg-violet-50"
            >
              Daftar Jadi Affiliate →
            </button>
          </form>
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
