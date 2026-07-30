import Link from "next/link";

export const metadata = { title: "Kebijakan Privasi - Tagih Otomatis" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
          ← Kembali
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Kebijakan Privasi</h1>
        <p className="mt-1 text-sm text-gray-400">Terakhir diperbarui: 30 Juli 2026</p>

        <div className="prose prose-sm mt-6 max-w-none text-gray-700 [&>h2]:mt-6 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:text-gray-900 [&>p]:mt-2 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5">
          <p>
            Tagih Otomatis ("kami") menghormati privasi Anda. Dokumen ini
            menjelaskan data apa yang kami kumpulkan, untuk apa data itu
            dipakai, dan pihak ketiga mana saja yang terlibat dalam layanan
            kami.
          </p>

          <h2>1. Data yang Kami Kumpulkan</h2>
          <ul>
            <li>Nama usaha, nama pemilik, email, dan nomor WhatsApp Anda saat mendaftar.</li>
            <li>
              Data pelanggan yang Anda input sendiri: nama dan nomor HP
              pelanggan, nominal dan tanggal tagihan.
            </li>
            <li>Token perangkat WhatsApp (Fonnte) yang Anda hubungkan.</li>
            <li>Riwayat transaksi langganan (nominal, tanggal, status pembayaran).</li>
          </ul>

          <h2>2. Untuk Apa Data Digunakan</h2>
          <ul>
            <li>Mengirim pengingat tagihan otomatis via WhatsApp atas nama Anda.</li>
            <li>Menampilkan dashboard, laporan, dan riwayat pengingat kepada Anda.</li>
            <li>Memproses pembayaran langganan dan mengaktifkan paket Anda.</li>
            <li>Mengirim link masuk (magic link) ke email Anda untuk login.</li>
          </ul>

          <h2>3. Pihak Ketiga yang Terlibat</h2>
          <p>Kami menggunakan layanan pihak ketiga berikut untuk menjalankan aplikasi:</p>
          <ul>
            <li><strong>Supabase</strong> — penyimpanan database dan autentikasi akun.</li>
            <li><strong>Fonnte</strong> — pengiriman pesan WhatsApp atas nama Anda ke nomor pelanggan yang Anda input.</li>
            <li><strong>Mayar</strong> — pemrosesan pembayaran langganan.</li>
            <li><strong>Vercel</strong> — hosting aplikasi.</li>
          </ul>
          <p>
            Kami tidak menjual data Anda ke pihak mana pun. Data hanya
            dibagikan ke pihak ketiga di atas sejauh diperlukan untuk
            menjalankan fungsi layanan.
          </p>

          <h2>4. Keamanan Data</h2>
          <p>
            Data disimpan dengan Row Level Security — setiap akun hanya bisa
            mengakses datanya sendiri. Token perangkat WhatsApp dan kunci
            pembayaran disimpan terenkripsi dan tidak pernah ditampilkan di
            kode yang berjalan di browser.
          </p>

          <h2>5. Hak Anda</h2>
          <p>
            Anda berhak meminta salinan data Anda atau meminta akun dan
            seluruh data terkait dihapus permanen. Hubungi kami melalui
            kontak di bawah untuk permintaan ini.
          </p>

          <h2>6. Retensi Data</h2>
          <p>
            Data disimpan selama akun Anda aktif. Jika akun dihapus, data
            tagihan dan pelanggan ikut dihapus permanen dalam waktu 30 hari.
          </p>

          <h2>7. Kontak</h2>
          <p>
            Pertanyaan seputar privasi dapat dikirim ke{" "}
            <a href="mailto:masagooscheck@gmail.com" className="text-blue-600 underline">
              masagooscheck@gmail.com
            </a>
            .
          </p>

          <p className="mt-8 text-xs text-gray-400">
            Dokumen ini adalah kebijakan awal untuk tahap early-bird dan akan
            diperbarui seiring pertumbuhan layanan.
          </p>
        </div>
      </div>
    </main>
  );
}
