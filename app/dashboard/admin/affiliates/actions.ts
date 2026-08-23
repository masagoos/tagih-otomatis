"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TIER_RATE: Record<string, number> = {
  affiliate: 0.3,
  perak: 0.35,
  emas: 0.4,
};

async function requireFounder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.FOUNDER_EMAIL) {
    redirect("/dashboard");
  }
  return user;
}

function slugifyCode(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base || "affiliate"}${suffix}`;
}

export async function createAffiliateFromLead(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();

  const leadId = String(formData.get("lead_id") ?? "");
  const tier = String(formData.get("tier") ?? "affiliate");
  const rate = TIER_RATE[tier] ?? TIER_RATE.affiliate;

  const { data: lead } = await admin
    .from("affiliate_leads")
    .select("name, email, phone")
    .eq("id", leadId)
    .single();
  if (!lead) redirect("/dashboard/admin/affiliates?error=lead-tidak-ditemukan");

  let code = "";
  let inserted = false;
  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    code = slugifyCode(lead!.name);
    const { error } = await admin.from("affiliates").insert({
      code,
      name: lead!.name,
      email: lead!.email,
      phone: lead!.phone,
      tier,
      commission_rate: rate,
    });
    if (!error) inserted = true;
    else if (!error.message.includes("duplicate")) {
      redirect(`/dashboard/admin/affiliates?error=${encodeURIComponent(error.message)}`);
    }
  }
  if (!inserted) redirect("/dashboard/admin/affiliates?error=gagal-buat-kode");

  await admin.from("affiliate_leads").update({ status: "active" }).eq("id", leadId);

  revalidatePath("/dashboard/admin/affiliates");
  redirect(`/dashboard/admin/affiliates?success=affiliate-dibuat&code=${code}`);
}

export async function rejectLead(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();
  const leadId = String(formData.get("lead_id") ?? "");
  await admin.from("affiliate_leads").update({ status: "rejected" }).eq("id", leadId);
  revalidatePath("/dashboard/admin/affiliates");
  redirect("/dashboard/admin/affiliates");
}

export async function markCommissionPaid(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();
  const commissionId = String(formData.get("commission_id") ?? "");
  await admin
    .from("affiliate_commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId);
  revalidatePath("/dashboard/admin/affiliates");
  redirect("/dashboard/admin/affiliates");
}

export async function toggleAffiliateStatus(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();
  const affiliateId = String(formData.get("affiliate_id") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "active");
  await admin.from("affiliates").update({ status: nextStatus }).eq("id", affiliateId);
  revalidatePath("/dashboard/admin/affiliates");
  redirect("/dashboard/admin/affiliates");
}

export async function updateAffiliate(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const tier = String(formData.get("tier") ?? "affiliate");
  const status = String(formData.get("status") ?? "active");
  const rate = TIER_RATE[tier] ?? TIER_RATE.affiliate;

  if (!name || !email) {
    redirect(`/dashboard/admin/affiliates/${id}/edit?error=data-tidak-lengkap`);
  }

  const { error } = await admin
    .from("affiliates")
    .update({ name, email, phone: phone || null, tier, commission_rate: rate, status })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard/admin/affiliates/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/admin/affiliates");
  redirect("/dashboard/admin/affiliates?success=affiliate-diperbarui");
}

export async function deleteAffiliate(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "");

  // affiliate_commissions.affiliate_id dan profiles.referred_by TIDAK cascade —
  // affiliate dengan riwayat komisi/referral sengaja tidak boleh dihapus begitu
  // saja (akan merusak riwayat keuangan). Nonaktifkan saja lewat tombol status.
  const [{ count: commissionCount }, { count: referredCount }] = await Promise.all([
    admin.from("affiliate_commissions").select("id", { count: "exact", head: true }).eq("affiliate_id", id),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", id),
  ]);

  if ((commissionCount ?? 0) > 0 || (referredCount ?? 0) > 0) {
    redirect(
      "/dashboard/admin/affiliates?error=" +
        encodeURIComponent("Tidak bisa dihapus — affiliate ini punya riwayat komisi atau pelanggan referral. Nonaktifkan saja.")
    );
  }

  const { error } = await admin.from("affiliates").delete().eq("id", id);
  if (error) {
    redirect(`/dashboard/admin/affiliates?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/admin/affiliates");
  redirect("/dashboard/admin/affiliates?success=affiliate-dihapus");
}

export async function deleteLead(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();
  const leadId = String(formData.get("lead_id") ?? "");
  await admin.from("affiliate_leads").delete().eq("id", leadId);
  revalidatePath("/dashboard/admin/affiliates");
  redirect("/dashboard/admin/affiliates?success=lead-dihapus");
}
