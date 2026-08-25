import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/phone";
import { submitAffiliateLead } from "./actions";
import LandingFaq from "../_components/landing-faq";
import styles from "../page.module.css";

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
    perks: [
      "Semua benefit tingkat Affiliate",
      "Akses lebih awal ke fitur baru",
      "Materi promosi tambahan",
    ],
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

const FAQ_ITEMS = [
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
];

function CheckIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M8 12l3 3 6-6" />
      <path d="M4 10l4-4 4 2 4-2 4 4" />
      <path d="M2 12l4 6h3l-3-6" />
      <path d="M22 12l-4 6h-3l3-6" />
    </svg>
  );
}

export default async function AffiliatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <main className={styles.page}>
      {/* ============ NAV ============ */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>
              <Image src="/logo-masagoos.png" alt="Masagoos Studio" width={64} height={64} />
            </span>
            TagihOtomatis
          </Link>
          <Link href="/" className={styles.navLogin}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.simpleHero}`}>
          <span className={styles.heroBadge}>✦ Program Affiliate</span>
          <h1>
            Rekomendasikan TagihOtomatis,
            <br />
            dapat <span className={styles.accent}>komisi setiap bulan.</span>
          </h1>
          <p className={styles.heroSub}>
            Cocok untuk pendamping UMKM, konsultan bisnis, atau siapa pun dengan jaringan pelaku
            UMKM. Komisi dibayar berulang — bukan cuma sekali — selama pelanggan yang Anda
            referensikan tetap aktif berlangganan.
          </p>
          <div className={styles.heroCta}>
            <a href="#daftar" className={`${styles.btn} ${styles.btnPrimary}`}>
              Daftar Jadi Affiliate →
            </a>
            <a href="#tingkatan" className={`${styles.btn} ${styles.btnGhost}`}>
              Lihat Skema Komisi ↓
            </a>
          </div>
          <p className={styles.heroFootnote}>
            Pendaftaran diproses langsung oleh tim kami — Anda akan mendapat link referral
            pribadi lewat email dalam 1×24 jam.
          </p>
        </div>
      </section>

      {/* ============ CARA KERJA ============ */}
      <section className={`${styles.section} ${styles.sectionSoft}`} id="cara-kerja">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <span className={styles.eyebrow}>Simpel</span>
            <h2 style={{ marginTop: 12 }}>Cara Kerjanya</h2>
          </div>
          <div className={styles.problemGrid}>
            {[
              {
                n: "01",
                t: "Daftar",
                d: "Kirim data diri lewat form di bawah — kami proses manual, bukan robot, supaya Anda benar-benar terhubung dengan tim.",
              },
              {
                n: "02",
                t: "Dapat Link Pribadi",
                d: "Anda menerima link referral unik yang bisa dibagikan lewat WhatsApp, media sosial, atau komunitas Anda.",
              },
              {
                n: "03",
                t: "Terima Komisi Bulanan",
                d: "Setiap kali pelanggan hasil referral Anda membayar langganan, komisi otomatis tercatat dan dibayarkan.",
              },
            ].map((step) => (
              <div key={step.n} className={styles.problemCard}>
                <span className={styles.problemNum}>{step.n}</span>
                <h3 style={{ marginTop: 16 }}>{step.t}</h3>
                <p>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TINGKATAN KOMISI ============ */}
      <section className={styles.section} id="tingkatan">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <span className={styles.eyebrow}>Skema Komisi</span>
            <h2 style={{ marginTop: 12 }}>3 tingkatan affiliate.</h2>
            <p>
              Naik tingkat otomatis begitu jumlah pelanggan aktif Anda bertambah — tidak perlu
              mendaftar ulang.
            </p>
          </div>
          <div className={styles.tierGrid}>
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`${styles.tierCard} ${tier.highlight ? styles.tierCardFeatured : ""}`}
              >
                {tier.highlight && <span className={styles.priceBadge}>Paling Diminati</span>}
                <div className={styles.pricePlan}>{tier.name}</div>
                <div className={styles.tierCommission}>
                  {tier.commission}%<span> komisi/bulan</span>
                </div>
                <div className={styles.tierReqLabel}>Syarat</div>
                <div className={styles.tierReqText}>{tier.requirement}</div>
                <ul>
                  {tier.perks.map((perk) => (
                    <li key={perk}>
                      <CheckIcon />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTOH PERHITUNGAN ============ */}
      <section className={`${styles.section} ${styles.sectionTight} ${styles.sectionSoft}`}>
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <span className={styles.eyebrow}>Contoh Nyata</span>
            <h2 style={{ marginTop: 12 }}>Berapa komisi yang Anda terima?</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.compTable}>
              <thead>
                <tr>
                  <th>Paket Pelanggan</th>
                  <th>Affiliate (30%)</th>
                  <th>Perak (35%)</th>
                  <th>Emas (40%)</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((ex) => (
                  <tr key={ex.plan}>
                    <td>
                      {ex.plan} — {formatRupiah(ex.price)}/bulan
                    </td>
                    <td>{formatRupiah(Math.round(ex.price * 0.3))}/bulan</td>
                    <td>{formatRupiah(Math.round(ex.price * 0.35))}/bulan</td>
                    <td>{formatRupiah(Math.round(ex.price * 0.4))}/bulan</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tableFootnote}>
            Komisi dihitung dari nilai langganan aktual per bulan, dibayarkan berulang selama
            pelanggan tersebut tetap berlangganan — bukan komisi sekali saja.
          </p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className={styles.section} id="faq">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 520 }}>
            <h2>Pertanyaan umum.</h2>
          </div>
          <LandingFaq items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ============ FORM PENDAFTARAN ============ */}
      <section className={`${styles.section} ${styles.sectionTight}`} id="daftar">
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.formIconWrap}>
              <HandshakeIcon />
            </div>
            <h2>Siap jadi partner kami?</h2>
            <p className={styles.formSub}>
              Isi data di bawah — tim kami akan menghubungi Anda dalam 1×24 jam.
            </p>

            {success && (
              <div className={styles.alertSuccess}>
                ✓ Terima kasih! Pendaftaran Anda sudah kami terima. Kami akan menghubungi lewat
                email dalam 1×24 jam.
              </div>
            )}
            {error && (
              <div className={styles.alertError}>
                Pendaftaran gagal:{" "}
                {error === "data-tidak-lengkap"
                  ? "Nama dan email wajib diisi dengan benar."
                  : error}
              </div>
            )}

            <form action={submitAffiliateLead} className={styles.formFields}>
              <input
                type="text"
                name="name"
                placeholder="Nama lengkap"
                required
                className={styles.formInput}
              />
              <input
                type="text"
                name="network"
                placeholder="Jaringan/komunitas (opsional)"
                className={styles.formInput}
              />
              <input
                type="email"
                name="email"
                placeholder="Email aktif"
                required
                className={styles.formInput}
              />
              <input
                type="text"
                name="phone"
                placeholder="No. WhatsApp (opsional, 0812xxxxxxxx)"
                className={styles.formInput}
              />
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary} ${styles.formSubmit}`}
              >
                Daftar Jadi Affiliate →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.logo}>
                <span className={styles.logoMark}>
                  <Image src="/logo-masagoos.png" alt="Masagoos Studio" width={64} height={64} />
                </span>
                TagihOtomatis
              </Link>
              <p className={styles.footerTagline}>Penagihan lebih rapi. Pembayaran lebih cepat.</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <Link href="/">Beranda</Link>
                <a href="#tingkatan">Skema Komisi</a>
                <a href="#daftar">Daftar</a>
              </div>
              <div className={styles.footerCol}>
                <Link href="/syarat-layanan">Syarat Layanan</Link>
                <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
                <Link href="/kebijakan-refund">Kebijakan Refund</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>© 2026 TagihOtomatis. Seluruh hak cipta dilindungi.</div>
        </div>
      </footer>
    </main>
  );
}
