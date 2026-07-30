import Link from "next/link";

export const metadata = { title: "Syarat Layanan - Tagih Otomatis" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
          ← Kembali
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Syarat Layanan</h1>
        <p className="mt-1 text-sm text-gray-400">Terakhir diperbarui: 30 Juli 2026</p>

        <div className="prose prose-sm mt-6 max-w-none text-gray-700 [&>h2]:mt-6 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:text-gray-900 [&>p]:mt-2 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5">
          <p>
            Dengan mendaftar dan menggunakan Tagih Otomatis, Anda menyetujui
            syarat berikut.
          </p>

          <h2>1. Deskripsi Layanan</h2>
          <p>
            Tagih Otomatis adalah alat bantu untuk mencatat tagihan dan
            mengirim pengingat pembayaran otomatis via WhatsApp ke nomor yang
            Anda input sendiri. Kami bukan penyedia layanan WhatsApp resmi —
            pengiriman pesan dijalankan melalui pihak ketiga (Fonnte) yang
            terhubung ke nomor WhatsApp milik Anda sendiri.
          </p>

          <h2>2. Akun & Tanggung Jawab Anda</h2>
          <ul>
            <li>Anda bertanggung jawab atas kebenaran data yang diinput (nama, nomor HP, nominal tagihan).</li>
            <li>Anda bertanggung jawab menjaga kerahasiaan token perangkat WhatsApp dan kredensial akun Anda.</li>
            <li>
              Anda hanya boleh mengirim pengingat ke nomor pelanggan yang
              memang memiliki hubungan transaksi/tagihan sah dengan usaha
              Anda — bukan untuk mengirim pesan massal/promosi ke nomor yang
              tidak meminta atau tidak relevan.
            </li>
          </ul>

          <h2>3. Paket & Harga</h2>
          <ul>
            <li>Masa uji coba gratis 14 hari dengan batas pesan terbatas.</li>
            <li>Paket berbayar (Starter/Pro) ditagih manual per bulan melalui Mayar — bukan langganan otomatis (auto-charge).</li>
            <li>Harga dan batas kuota dapat berubah dengan pemberitahuan wajar sebelumnya.</li>
          </ul>

          <h2>4. Batasan Layanan</h2>
          <ul>
            <li>
              Pengiriman WhatsApp bergantung pada layanan pihak ketiga
              (Fonnte) dan kebijakan WhatsApp itu sendiri. Kami tidak dapat
              menjamin 100% keterkiriman pesan, dan tidak bertanggung jawab
              atas pemblokiran/pembatasan yang dilakukan WhatsApp terhadap
              nomor Anda.
            </li>
            <li>
              Kami berhak menghentikan atau menangguhkan akun yang terbukti
              menyalahgunakan layanan untuk spam atau aktivitas melanggar
              hukum.
            </li>
          </ul>

          <h2>5. Penghentian Layanan</h2>
          <p>
            Anda dapat berhenti berlangganan kapan saja. Data Anda tetap
            tersimpan sampai Anda meminta penghapusan (lihat Kebijakan
            Privasi).
          </p>

          <h2>6. Hukum yang Berlaku</h2>
          <p>
            Syarat ini tunduk pada hukum Republik Indonesia.
          </p>

          <h2>7. Kontak</h2>
          <p>
            Pertanyaan dapat dikirim ke{" "}
            <a href="mailto:masagooscheck@gmail.com" className="text-blue-600 underline">
              masagooscheck@gmail.com
            </a>
            .
          </p>

          <p className="mt-8 text-xs text-gray-400">
            Dokumen ini adalah syarat layanan awal untuk tahap early-bird dan
            akan diperbarui seiring pertumbuhan layanan.
          </p>
        </div>
      </div>
    </main>
  );
}
