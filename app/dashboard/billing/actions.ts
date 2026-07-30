"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPaymentLink } from "@/lib/mayar";

const PLAN_PRICE: Record<"starter" | "pro", number> = {
  starter: 75000,
  pro: 150000,
};

export async function upgradePlan(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = String(formData.get("plan") ?? "");
  if (plan !== "starter" && plan !== "pro") {
    redirect("/dashboard/billing?error=Paket+tidak+valid");
  }

  const amount = PLAN_PRICE[plan];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Kalau sudah ada link "menunggu pembayaran" untuk paket yang sama, pakai ulang
  // — hindari bikin banyak link Mayar tiap kali user klik ulang tombol upgrade.
  const { data: existing } = await supabase
    .from("payments")
    .select("mayar_checkout_url")
    .eq("user_id", user.id)
    .eq("plan", plan)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.mayar_checkout_url) {
    redirect(existing.mayar_checkout_url);
  }

  // Nama link Mayar harus unik per akun — tambahkan kode singkat acak.
  const uniqueSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const result = await createPaymentLink({
    name: `Tagih Otomatis - ${plan === "starter" ? "Starter" : "Pro"} #${uniqueSuffix}`,
    amount,
    redirectUrl: `${appUrl}/dashboard/billing?success=1`,
  });

  if (!result.ok || !result.link || !result.id) {
    redirect(`/dashboard/billing?error=${encodeURIComponent(result.error ?? "Gagal membuat link pembayaran")}`);
  }

  const { error: insertErr } = await supabase.from("payments").insert({
    user_id: user.id,
    plan,
    amount,
    mayar_link_id: result.id,
    mayar_checkout_url: result.link,
    status: "pending",
  });
  if (insertErr) {
    redirect(`/dashboard/billing?error=${encodeURIComponent(insertErr.message)}`);
  }

  redirect(result.link);
}
