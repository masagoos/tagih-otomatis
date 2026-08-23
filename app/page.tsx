import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/phone";
import LandingNav from "./_components/landing-nav";
import LandingFaq from "./_components/landing-faq";
import styles from "./page.module.css";

export const metadata = {
  title: "Tagih Otomatis — Pengingat Tagihan WhatsApp untuk UMKM",
  description:
    "Catat tagihan sekali, sistem otomatis kirim pengingat ke WhatsApp pelanggan Anda. Berhenti nagih manual — mulai gratis 14 hari.",
};

const TIER_META: Record<string, { name: string; price: number; highlight?: boolean }> = {
  starter: { name: "Starter", price: 75000 },
  pro: { name: "Pro", price: 150000, highlight: true },
};

function CheckIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.35 0-2.62-.32-3.75-.9L3 21l1.9-5.75A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function SheetIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M4 4h16v16H4z" />
      <path d="M8 9h8M8 13h5M8 17h8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </svg>
  );
}

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: limits } = await supabase
    .from("plan_limits")
    .select("plan, monthly_messages, max_devices");
  const limitsByPlan = new Map((limits ?? []).map((l) => [l.plan, l]));
  const starterLimit = limitsByPlan.get("starter");
  const proLimit = limitsByPlan.get("pro");

  const faqItems = [
    {
      q: "Apakah data tagihan dan pelanggan saya aman?",
      a: "Ya. Seluruh data tagihan dan kontak pelanggan disimpan dengan enkripsi dan hanya dapat diakses dari akun Anda sendiri. Selengkapnya di Kebijakan Privasi kami.",
    },
    {
      q: "Apakah nomor WhatsApp saya bisa kena blokir?",
      a: "Kami mengirim dengan jeda otomatis antar pesan dan hanya ke nomor pelanggan yang memang punya tagihan dengan usaha Anda — bukan kirim pesan massal ke daftar nomor asing.",
    },
    {
      q: "Perlu WhatsApp Business?",
      a: "Tidak wajib. Anda bisa hubungkan nomor WhatsApp biasa yang sudah Anda pakai untuk jualan.",
    },
    {
      q: "Bagaimana cara kerja reminder otomatis?",
      a: "Setelah Anda mencatat tagihan dan tanggal jatuh tempo, sistem menjadwalkan dan mengirim pesan WhatsApp secara otomatis sesuai pengaturan Anda — dan berhenti begitu tagihan ditandai lunas.",
    },
    {
      q: "Berapa lama proses setup?",
      a: "Sekitar 10 menit. Anda cukup membuat akun, menghubungkan WhatsApp, dan mengimpor atau mencatat tagihan pertama.",
    },
    {
      q: "Bagaimana kalau saya mau berhenti?",
      a: "Tidak ada kontrak mengikat. Bayar per bulan, dan bisa berhenti kapan saja tanpa penalti dari pengaturan akun.",
    },
    {
      q: "Apa perbedaan paket Starter dan Pro?",
      a: `Starter mencakup ${starterLimit?.monthly_messages ?? "sejumlah"} pesan pengingat/bulan dengan ${starterLimit?.max_devices ?? 1} nomor WhatsApp. Pro mencakup ${proLimit?.monthly_messages ?? "lebih banyak"} pesan pengingat/bulan dengan ${proLimit?.max_devices ?? 1} nomor WhatsApp — cocok untuk volume tagihan yang lebih besar. Tagihan dan pelanggan tidak dibatasi di kedua paket.`,
    },
  ];

  return (
    <main className={styles.page}>
      {/* ============ NAV ============ */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a href="#" className={styles.logo}>
            <span className={styles.logoMark}>
              <Image src="/logo-masagoos.png" alt="Masagoos Studio" width={64} height={64} />
            </span>
            TagihOtomatis
          </a>
          <nav className={styles.navMenu}>
            <a href="#produk">Produk</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#harga">Harga</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.navLogin}>
              Masuk
            </Link>
            <Link href="/login" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
              Coba Gratis
            </Link>
          </div>
          <LandingNav />
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>✦ Otomatisasi Penagihan untuk UMKM</span>
            <h1>
              Tagihan terkirim.
              <br />
              Pembayaran <span className={styles.accent}>lebih cepat.</span>
            </h1>
            <p className={styles.heroSub}>
              Catat tagihan, jadwalkan pengingat WhatsApp, dan pantau pembayaran pelanggan tanpa
              harus menagih satu per satu.
            </p>
            <div className={styles.heroCta}>
              <Link href="/login" className={`${styles.btn} ${styles.btnPrimary}`}>
                Mulai Gratis 14 Hari →
              </Link>
              <a href="#cara-kerja" className={`${styles.btn} ${styles.btnGhost}`}>
                Lihat Cara Kerjanya ↓
              </a>
            </div>
            <div className={styles.heroTrust}>
              <span>
                <CheckIcon />
                Tanpa kartu kredit
              </span>
              <span>
                <CheckIcon />
                Setup sekitar 10 menit
              </span>
              <span>
                <CheckIcon />
                Batalkan kapan saja
              </span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.dash}>
              <div className={styles.dashHead}>
                <div className={styles.dashTitle}>
                  <span className={styles.dashDot} />
                  Dashboard Tagihan
                </div>
                <div className={styles.dashNav}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className={styles.dashKpis}>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Total Tagihan</div>
                  <div className={styles.kpiValue}>Rp128.450.000</div>
                </div>
                <div className={`${styles.kpi} ${styles.kpiAccent}`}>
                  <div className={styles.kpiLabel}>Tertagih</div>
                  <div className={styles.kpiValue}>Rp96.200.000</div>
                </div>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Belum Dibayar</div>
                  <div className={styles.kpiValue}>Rp32.250.000</div>
                </div>
              </div>
              <div className={styles.dashChart}>
                <div className={styles.dashChartLabel}>Cash collection — 7 hari terakhir</div>
                <svg viewBox="0 0 300 48" preserveAspectRatio="none">
                  <polyline
                    points="0,38 40,32 80,34 120,20 160,24 200,12 240,16 300,6"
                    fill="none"
                    stroke="#37BFA7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="300" cy="6" r="3.5" fill="#37BFA7" />
                </svg>
              </div>
              <div className={styles.dashListLabel}>Tagihan Terbaru</div>
              <div className={styles.invoiceRow}>
                <div>
                  <div className={styles.invName}>Toko Berkah Jaya</div>
                  <div className={styles.invAmt}>Rp750.000</div>
                </div>
                <span className={`${styles.status} ${styles.statusLunas}`}>LUNAS</span>
              </div>
              <div className={styles.invoiceRow}>
                <div>
                  <div className={styles.invName}>Warung Melati</div>
                  <div className={styles.invAmt}>Rp350.000</div>
                </div>
                <span className={`${styles.status} ${styles.statusTerkirim}`}>TERKIRIM</span>
              </div>
              <div className={styles.invoiceRow}>
                <div>
                  <div className={styles.invName}>Bu Rina Catering</div>
                  <div className={styles.invAmt}>Rp1.200.000</div>
                </div>
                <span className={`${styles.status} ${styles.statusMenunggu}`}>MENUNGGU</span>
              </div>
            </div>

            <div className={styles.notifCard}>
              <div className={styles.notifHead}>
                <WhatsAppIcon />
                Reminder Berhasil Dikirim
              </div>
              <div className={styles.notifBody}>
                Halo Kak Budi, tagihan <b>INV-0012</b> sebesar <b>Rp350.000</b> akan jatuh tempo 3
                hari lagi.
              </div>
              <div className={styles.notifFoot}>
                <span>09:00</span>
                <span className={styles.notifCheck}>Terkirim ✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className={styles.trustStrip}>
        <div className={`${styles.container} ${styles.trustStripInner}`}>
          <p className={styles.trustLead}>
            Dirancang untuk membantu UMKM mengelola tagihan dengan lebih rapi.
          </p>
          <div className={styles.trustItems}>
            <span>
              <WhatsAppIcon />
              WhatsApp Automation
            </span>
            <span>
              <LockIcon />
              Data Terenkripsi
            </span>
            <span>
              <SheetIcon />
              Import Excel/CSV
            </span>
            <span>
              <ClockIcon />
              Real-time Monitoring
            </span>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section className={styles.section} id="produk">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 640 }}>
            <h2>
              Masalahnya bukan pelanggan tidak mau bayar.
              <br />
              Anda sering lupa menagih.
            </h2>
          </div>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <span className={styles.problemNum}>01</span>
              <div className={styles.problemIcon}>
                <ChatIcon />
              </div>
              <h3>Sungkan Mengingatkan</h3>
              <p>Menagih pelanggan berkali-kali terasa tidak nyaman.</p>
            </div>
            <div className={styles.problemCard}>
              <span className={styles.problemNum}>02</span>
              <div className={styles.problemIcon}>
                <StackIcon />
              </div>
              <h3>Catatan Berantakan</h3>
              <p>Tagihan tersebar di buku, spreadsheet, chat, dan ingatan.</p>
            </div>
            <div className={styles.problemCard}>
              <span className={styles.problemNum}>03</span>
              <div className={styles.problemIcon}>
                <CashIcon />
              </div>
              <h3>Cash Flow Tersendat</h3>
              <p>Semakin lama tagihan belum dibayar, semakin lama uang masuk ke bisnis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BEFORE / AFTER ============ */}
      <section className={`${styles.section} ${styles.sectionTight}`}>
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <h2>Dari nagih manual menjadi otomatis.</h2>
          </div>
          <div className={styles.baGrid}>
            <div className={`${styles.baCard} ${styles.baBefore}`}>
              <span className={styles.baLabel}>Sebelum</span>
              <span className={styles.baSub}>Manual</span>
              <ul>
                {[
                  "Cek spreadsheet",
                  "Cari chat pelanggan",
                  "Ingat tanggal jatuh tempo",
                  "Kirim pesan satu per satu",
                  "Cek siapa yang sudah bayar",
                  "Takut lupa follow-up",
                ].map((t) => (
                  <li key={t}>
                    <span className={styles.baMark}>
                      <XIcon />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${styles.baCard} ${styles.baAfter}`}>
              <span className={styles.baLabel}>Sesudah</span>
              <span className={styles.baSub}>TagihOtomatis</span>
              <ul>
                {[
                  "Input sekali",
                  "Jadwal otomatis",
                  "Reminder WhatsApp",
                  "Status pembayaran",
                  "Dashboard real-time",
                  "Reminder berhenti saat lunas",
                ].map((t) => (
                  <li key={t}>
                    <span className={styles.baMark}>
                      <CheckIcon />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section className={styles.section} id="cara-kerja">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <h2>
              Anda catat sekali.
              <br />
              TagihOtomatis yang bekerja.
            </h2>
          </div>
          <div className={styles.workflow}>
            {[
              { n: "01", t: "Catat", d: "Masukkan pelanggan, nominal, dan tanggal jatuh tempo." },
              { n: "02", t: "Jadwalkan", d: "Sistem menentukan kapan reminder dikirim." },
              { n: "03", t: "Ingatkan", d: "WhatsApp mengirim pesan secara otomatis." },
              { n: "04", t: "Pantau", d: "Anda melihat status pembayaran dari dashboard." },
            ].map((step) => (
              <div key={step.n} className={styles.wfStep}>
                <div className={styles.wfBadge}>{step.n}</div>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRODUCT SHOWCASE ============ */}
      <section className={`${styles.section} ${styles.sectionSoft}`}>
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <h2>
              Satu dashboard.
              <br />
              Semua tagihan terpantau.
            </h2>
          </div>
          <div className={styles.showcasePanel}>
            <div className={styles.showcaseInner}>
              <div className={styles.showcaseTop}>
                <div className={styles.showcaseCallouts}>
                  <div>
                    <div className={`${styles.calloutValue} ${styles.calloutAccent}`}>
                      Rp4.250.000
                    </div>
                    <div className={styles.calloutLabel}>tertagih bulan ini</div>
                  </div>
                  <div>
                    <div className={styles.calloutValue}>6</div>
                    <div className={styles.calloutLabel}>tagihan belum dibayar</div>
                  </div>
                  <div>
                    <div className={styles.calloutValue}>09.00</div>
                    <div className={styles.calloutLabel}>reminder berikutnya</div>
                  </div>
                  <div>
                    <div className={`${styles.calloutValue} ${styles.calloutAccent}`}>12</div>
                    <div className={styles.calloutLabel}>reminder berhasil dikirim</div>
                  </div>
                </div>
              </div>
              <div className={styles.showcaseBody}>
                <div>
                  <div className={styles.showcaseTableHead}>
                    <span>Pelanggan</span>
                    <span>Nominal</span>
                    <span>Status</span>
                  </div>
                  {[
                    { name: "Toko Berkah Jaya", amt: "Rp750.000", status: "LUNAS", cls: styles.statusLunas },
                    { name: "Warung Melati", amt: "Rp350.000", status: "TERKIRIM", cls: styles.statusTerkirim },
                    { name: "Bu Rina Catering", amt: "Rp1.200.000", status: "MENUNGGU", cls: styles.statusMenunggu },
                    { name: "Kedai Sinar Pagi", amt: "Rp480.000", status: "TERLAMBAT", cls: styles.statusTerlambat },
                  ].map((row) => (
                    <div key={row.name} className={styles.showcaseRow}>
                      <span className={styles.invName}>{row.name}</span>
                      <span className={styles.invAmt}>{row.amt}</span>
                      <span className={`${styles.status} ${row.cls}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.showcaseSide}>
                  <div className={styles.sideTitle}>Ringkasan Bulan Ini</div>
                  {[
                    ["Total tagihan", "Rp128.450.000"],
                    ["Tertagih", "Rp96.200.000"],
                    ["Belum dibayar", "Rp32.250.000"],
                    ["Reminder terkirim", "12x"],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.sideRow}>
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BENTO FEATURES ============ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Fitur</span>
            <h2 style={{ marginTop: 12 }}>Semua yang dibutuhkan untuk menagih lebih rapi.</h2>
          </div>
          <div className={styles.bento}>
            <div className={`${styles.bentoCard} ${styles.bLarge}`}>
              <div className={styles.bentoIcon}>
                <BellIcon />
              </div>
              <h3>Pengingat Otomatis</h3>
              <p>
                Reminder terkirim ke WhatsApp pelanggan sebelum, pada saat, dan setelah jatuh
                tempo — tanpa Anda kirim manual.
              </p>
              <div className={styles.miniMsg}>
                <div className={styles.miniMsgHead}>
                  <WhatsAppIcon />
                  TAGIH OTOMATIS
                </div>
                <p>
                  &quot;Tagihan INV-0012 sebesar Rp350.000 akan jatuh tempo 3 hari lagi.&quot; —
                  terkirim otomatis pukul 09:00
                </p>
              </div>
            </div>
            <div className={`${styles.bentoCard} ${styles.bMedium}`}>
              <div className={styles.bentoIcon}>
                <ChartIcon />
              </div>
              <h3>Laporan Real-time</h3>
              <p>Pantau tagihan lunas, terkirim, dan menunggu langsung dari satu dashboard.</p>
              <div className={styles.bentoDetail}>
                <b>Update otomatis</b> setiap ada pembayaran masuk
              </div>
            </div>
            <div className={`${styles.bentoCard} ${styles.bMedium}`}>
              <div className={styles.bentoIcon}>
                <SheetIcon />
              </div>
              <h3>Import Excel/CSV</h3>
              <p>Punya data tagihan lama di spreadsheet? Tinggal upload, sistem yang rapikan.</p>
              <div className={styles.bentoDetail}>
                Mendukung format <b>.xlsx</b> dan <b>.csv</b>
              </div>
            </div>
            <div className={`${styles.bentoCard} ${styles.bSmall}`}>
              <div className={styles.bentoIcon}>
                <StackIcon />
              </div>
              <h3>Template Pesan</h3>
              <p>Sesuaikan gaya bahasa reminder agar sesuai karakter bisnis Anda.</p>
            </div>
            <div className={`${styles.bentoCard} ${styles.bSmall}`}>
              <div className={styles.bentoIcon}>
                <ClockIcon />
              </div>
              <h3>Jadwal Fleksibel</h3>
              <p>Atur kapan reminder dikirim — sebelum, saat, atau setelah jatuh tempo.</p>
            </div>
            <div className={`${styles.bentoCard} ${styles.bSmall}`}>
              <div className={styles.bentoIcon}>
                <LockIcon />
              </div>
              <h3>Data Terenkripsi</h3>
              <p>Data tagihan dan pelanggan Anda disimpan secara aman dan terenkripsi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRODUCT PROOF ============ */}
      <section className={`${styles.section} ${styles.sectionTight} ${styles.sectionDeep}`}>
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 560 }}>
            <span className={styles.eyebrow}>Kenapa percaya TagihOtomatis</span>
            <h2 style={{ marginTop: 12 }}>Trust dibangun dari produk, bukan janji.</h2>
          </div>
          <div className={styles.proofGrid}>
            {[
              { icon: <LockIcon />, t: "Keamanan Data", d: "Data tagihan dan kontak pelanggan tersimpan terenkripsi di server yang aman." },
              { icon: <BellIcon />, t: "Workflow Sederhana", d: "Catat, jadwalkan, ingatkan, pantau — empat langkah tanpa proses rumit." },
              { icon: <ChartIcon />, t: "Dashboard Nyata", d: "Bukan mockup — dashboard yang Anda lihat adalah tampilan produk yang sebenarnya." },
              { icon: <ClockIcon />, t: "Free Trial 14 Hari", d: "Coba seluruh fitur tanpa kartu kredit sebelum memutuskan berlangganan." },
              { icon: <CashIcon />, t: "Harga Transparan", d: "Dua paket, harga jelas di muka. Tidak ada biaya tersembunyi." },
              { icon: <WhatsAppIcon />, t: "WhatsApp Native", d: "Reminder dikirim ke WhatsApp yang sudah dipakai pelanggan Anda sehari-hari." },
            ].map((item) => (
              <div key={item.t} className={styles.proofCard}>
                <div className={styles.iconWrap}>{item.icon}</div>
                <h4>{item.t}</h4>
                <p>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NUMERIC PROOF ============ */}
      <section className={styles.sectionTight}>
        <div className={styles.container}>
          <div className={styles.numericStrip}>
            <div className={styles.numCell}>
              <div className={styles.numValue}>14 Hari</div>
              <div className={styles.numLabel}>Free Trial</div>
            </div>
            <div className={styles.numCell}>
              <div className={styles.numValue}>10 Menit</div>
              <div className={styles.numLabel}>Setup</div>
            </div>
            <div className={styles.numCell}>
              <div className={styles.numValue}>{starterLimit?.monthly_messages ?? 200}+</div>
              <div className={styles.numLabel}>Pesan/bulan</div>
            </div>
            <div className={styles.numCell}>
              <div className={styles.numValue}>1 Dashboard</div>
              <div className={styles.numLabel}>Semua tagihan</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className={styles.section} id="harga">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 520 }}>
            <h2>Harga sederhana, tanpa kejutan.</h2>
            <p>Pilih paket sesuai skala tagihan bisnis Anda.</p>
          </div>
          <div className={styles.pricingGrid}>
            {Object.entries(TIER_META).map(([key, tier]) => {
              const limit = limitsByPlan.get(key);
              return (
                <div
                  key={key}
                  className={`${styles.priceCard} ${tier.highlight ? styles.priceCardFeatured : ""}`}
                >
                  {tier.highlight && <span className={styles.priceBadge}>Paling Populer</span>}
                  <div className={styles.pricePlan}>{tier.name}</div>
                  <div className={styles.priceAmount}>
                    <span className={styles.amt}>{formatRupiah(tier.price)}</span>
                    <span className={styles.per}>/bulan</span>
                  </div>
                  <ul>
                    <li>
                      <CheckIcon />
                      {limit?.monthly_messages ?? "—"} pesan pengingat/bulan
                    </li>
                    <li>
                      <CheckIcon />
                      {limit?.max_devices ?? 1} nomor WhatsApp
                    </li>
                    <li>
                      <CheckIcon />
                      Tagihan &amp; pelanggan tanpa batas
                    </li>
                  </ul>
                  <Link
                    href="/login"
                    className={`${styles.btn} ${tier.highlight ? styles.btnPrimary : styles.btnSecondary}`}
                  >
                    Mulai Gratis
                  </Link>
                </div>
              );
            })}
          </div>
          <div className={styles.pricingFoot}>
            <span>
              <CheckIcon />
              14 hari gratis
            </span>
            <span>
              <CheckIcon />
              Tanpa kartu kredit
            </span>
            <span>
              <CheckIcon />
              Berhenti kapan saja
            </span>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className={`${styles.section} ${styles.sectionSoft}`} id="faq">
        <div className={styles.container}>
          <div className={`${styles.sectionHead} ${styles.center}`} style={{ maxWidth: 520 }}>
            <h2>Pertanyaan yang sering ditanyakan.</h2>
          </div>
          <LandingFaq items={faqItems} />
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className={styles.sectionNavy}>
        <div className={`${styles.container} ${styles.finalCta}`}>
          <h2>
            Berhenti nagih manual.
            <br />
            Mulai otomatis hari ini.
          </h2>
          <p>
            Gunakan 14 hari pertama untuk melihat bagaimana TagihOtomatis membantu bisnis Anda
            mengelola tagihan dengan lebih rapi.
          </p>
          <div className={styles.finalCtaActions}>
            <Link href="/login" className={`${styles.btn} ${styles.btnOnNavy}`}>
              Coba Gratis 14 Hari →
            </Link>
          </div>
          <div className={styles.finalTrust}>
            Tanpa kartu kredit · Setup sekitar 10 menit · Batalkan kapan saja
          </div>
          <div className={styles.finalMini}>
            <div>
              <div className={styles.lbl}>Tertagih bulan ini</div>
              <div className={styles.val}>Rp4.250.000</div>
            </div>
            <div>
              <div className={styles.lbl}>Reminder terkirim</div>
              <div className={styles.val}>12x</div>
            </div>
            <div>
              <div className={styles.lbl}>Status</div>
              <div className={styles.val} style={{ color: "#37BFA7" }}>
                Real-time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <a href="#" className={styles.logo}>
                <span className={styles.logoMark}>
                  <Image src="/logo-masagoos.png" alt="Masagoos Studio" width={64} height={64} />
                </span>
                TagihOtomatis
              </a>
              <p className={styles.footerTagline}>Penagihan lebih rapi. Pembayaran lebih cepat.</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <a href="#produk">Produk</a>
                <a href="#harga">Harga</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className={styles.footerCol}>
                <Link href="/affiliate">Program Affiliate</Link>
                <Link href="/syarat-layanan">Syarat Layanan</Link>
              </div>
              <div className={styles.footerCol}>
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
