"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/phone";

export async function submitAffiliateLead(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const network = String(formData.get("network") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();

  if (!name || !email || !email.includes("@")) {
    redirect("/affiliate?error=data-tidak-lengkap");
  }

  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("affiliate_leads").insert({
    name,
    network: network || null,
    email,
    phone,
  });

  if (error) {
    redirect(`/affiliate?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/affiliate?success=1");
}
