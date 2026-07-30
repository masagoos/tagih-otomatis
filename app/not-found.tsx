import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow">
        <p className="text-5xl font-bold text-gray-200">404</p>
        <h1 className="mt-2 text-lg font-bold text-gray-900">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-gray-500">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </main>
  );
}
