import { completeProfile } from "./actions";

export default function OnboardingForm() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-xl font-bold text-gray-900">Selamat datang! 👋</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lengkapi data usaha Anda dulu — 30 detik saja.
        </p>
        <form action={completeProfile} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nama usaha</span>
            <input name="business_name" required placeholder="Katering Bu Sari"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nama Anda</span>
            <input name="owner_name" required placeholder="Sari Rahayu"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">No. WhatsApp Anda</span>
            <input name="phone" required placeholder="0812xxxxxxxx"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <button type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Mulai Pakai
          </button>
        </form>
      </div>
    </main>
  );
}
