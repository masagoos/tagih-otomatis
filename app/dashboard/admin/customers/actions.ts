"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/phone";

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

export async function updateCustomer(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");
  const businessName = String(formData.get("business_name") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const plan = String(formData.get("plan") ?? "trial");
  const subStatus = String(formData.get("sub_status") ?? "active");
  const planExpiresAtRaw = String(formData.get("plan_expires_at") ?? "").trim();

  if (!businessName || !ownerName) {
    redirect(`/dashboard/admin/customers/${id}/edit?error=data-tidak-lengkap`);
  }
  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    redirect(`/dashboard/admin/customers/${id}/edit?error=nomor-wa-tidak-valid`);
  }

  const { error } = await admin
    .from("profiles")
    .update({
      business_name: businessName,
      owner_name: ownerName,
      phone,
      plan,
      sub_status: subStatus,
      plan_expires_at: planExpiresAtRaw ? new Date(planExpiresAtRaw).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard/admin/customers/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/admin/customers");
  redirect("/dashboard/admin/customers?success=diperbarui");
}

export async function deleteCustomer(formData: FormData) {
  await requireFounder();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");

  // affiliate_commissions.user_id -> profiles.id TIDAK cascade (data komisi finansial,
  // sengaja tidak auto-hapus lewat FK) — hapus eksplisit dulu di sini.
  await admin.from("affiliate_commissions").delete().eq("user_id", id);

  // Hapus profil — otomatis cascade ke contacts, invoices, message_templates,
  // messages, payments, reminder_rules, wa_devices (lihat skema).
  const { error } = await admin.from("profiles").delete().eq("id", id);
  if (error) {
    redirect(`/dashboard/admin/customers?error=${encodeURIComponent(error.message)}`);
  }

  // Akun auth terpisah dari profil — harus dihapus manual lewat Admin API.
  await admin.auth.admin.deleteUser(id);

  revalidatePath("/dashboard/admin/customers");
  redirect("/dashboard/admin/customers?success=dihapus");
}
