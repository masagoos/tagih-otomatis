import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import OnboardingForm from "./onboarding-form";

const PLAN_LABEL: Record<string, string> = {
  trial: "Uji Coba",
  starter: "Starter",
  pro: "Pro",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, plan, trial_ends_at, sub_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return <OnboardingForm />;

  const trialExpired =
    profile.plan === "trial" && profile.trial_ends_at && new Date(profile.trial_ends_at) < new Date();
  const needsAttention = trialExpired || profile.sub_status === "past_due" || profile.sub_status === "suspended";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div>
              <h1 className="text-base font-bold text-gray-900">
                {profile.business_name}
              </h1>
              <p className={`text-xs ${needsAttention ? "font-medium text-red-600" : "text-gray-500"}`}>
                Paket: {PLAN_LABEL[profile.plan] ?? profile.plan}
                {profile.plan === "trial" && profile.trial_ends_at &&
                  ` — berakhir ${new Date(profile.trial_ends_at).toLocaleDateString("id-ID")}`}
                {needsAttention && " — perlu perhatian"}
              </p>
            </div>
            <nav className="flex flex-wrap gap-1 text-sm">
              <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                Ringkasan
              </Link>
              <Link href="/dashboard/invoices" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                Tagihan
              </Link>
              <Link href="/dashboard/contacts" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                Pelanggan
              </Link>
              <Link href="/dashboard/templates" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                Template
              </Link>
              <Link href="/dashboard/settings" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                Perangkat WA
              </Link>
              <Link href="/dashboard/reports" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                Laporan
              </Link>
              <Link
                href="/dashboard/billing"
                className={`rounded-lg px-3 py-1.5 hover:bg-gray-100 ${
                  needsAttention ? "font-semibold text-red-600 hover:text-red-700" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Langganan{needsAttention && " ⚠️"}
              </Link>
              {user.email === process.env.FOUNDER_EMAIL && (
                <>
                  <Link href="/dashboard/admin/customers" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    Kelola Pelanggan
                  </Link>
                  <Link href="/dashboard/admin/affiliates" className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    Kelola Affiliate
                  </Link>
                </>
              )}
            </nav>
          </div>
          <form action={signOut}>
            <button className="text-sm text-gray-500 hover:text-gray-900">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
