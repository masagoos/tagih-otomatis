import Link from "next/link";

export const metadata = { title: "Kebijakan Refund - Tagih Otomatis" };

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
          ← Kembali
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Kebijakan Refund & Pembatalan</h1>
        <p className="mt-1 text-sm text-gray-400">Terakhir diperbarui: 30 Juli 2026</p>

        <div className="prose prose-sm mt-6 max-w-none text-gray-700 [&>h2]:mt-6 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:text-gray-900 [&>p]:mt-2 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5">
          <p>
            Tagih Otomatis menggunakan sistem pembayaran manual per bulan
            (bukan langganan otomatis/auto-charge) melalui Mayar. Berikut
            kebijakan refund dan pembatalan kami.
          </p>

          <h2>1. Masa Uji Coba</h2>
          <p>
            Anda mendapat 14 hari uji coba gratis sebelum diminta membayar.
            Gunakan masa ini untuk memastikan layanan sesuai kebutuhan Anda
            sebelum upgrade.
          </p>

          <h2>2. Pembatalan</h2>
          <p>
            Karena tidak ada auto-charge, Anda tidak perlu melakukan apa pun
            untuk "berhenti berlangganan" — cukup tidak memperpanjang
            pembayaran bulan berikutnya. Akses paket berbayar tetap aktif
            sampai masa yang sudah dibayar habis.
          </p>

          <h2>3. Refund</h2>
          <p>
            Karena sifatnya bayar per bulan di muka, kami umumnya{" "}
            <strong>tidak memberikan refund</strong> untuk sisa masa aktif
            yang belum terpakai, kecuali dalam kondisi berikut:
          </p>
          <ul>
            <li>Kesalahan sistem yang mengakibatkan Anda dikenakan biaya lebih dari satu kali untuk periode yang sama (double payment).</li>
            <li>Layanan tidak dapat digunakan sama sekali akibat kesalahan dari pihak kami, dan tidak dapat diperbaiki dalam waktu wajar.</li>
          </ul>
          <p>
            Untuk pengajuan refund yang memenuhi kondisi di atas, hubungi
            kami dalam 7 hari sejak pembayaran dilakukan.
          </p>

          <h2>4. Cara Mengajukan Refund</h2>
          <p>
            Kirim email ke{" "}
            <a href="mailto:masagooscheck@gmail.com" className="text-blue-600 underline">
              masagooscheck@gmail.com
            </a>{" "}
            dengan menyertakan email akun Anda dan tanggal pembayaran. Kami
            akan merespons dalam 2x24 jam kerja.
          </p>

          <p className="mt-8 text-xs text-gray-400">
            Kebijakan ini adalah kebijakan awal untuk tahap early-bird dan
            akan diperbarui seiring pertumbuhan layanan.
          </p>
        </div>
      </div>
    </main>
  );
}
