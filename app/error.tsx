"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow">
        <p className="text-4xl">⚠️</p>
        <h1 className="mt-2 text-lg font-bold text-gray-900">Ada yang Salah</h1>
        <p className="mt-2 text-sm text-gray-500">
          Maaf, terjadi kesalahan tak terduga. Tim kami akan segera
          menindaklanjuti.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
