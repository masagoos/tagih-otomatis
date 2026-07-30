"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkDeviceStatus } from "@/lib/fonnte";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function connectDevice(formData: FormData) {
  const { supabase, user } = await requireUser();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) redirect("/dashboard/settings?error=Token+wajib+diisi");

  const check = await checkDeviceStatus(token);
  if (check.error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("Token ditolak Fonnte: " + check.error)}`);
  }
  if (!check.connected) {
    redirect(
      "/dashboard/settings?error=" +
        encodeURIComponent(
          "Token valid tapi nomor WA belum tersambung. Buka dashboard Fonnte, scan QR untuk device ini dulu, lalu coba lagi."
        )
    );
  }

  const { error } = await supabase.from("wa_devices").upsert(
    {
      user_id: user.id,
      phone_number: check.deviceNumber ?? "unknown",
      provider: "fonnte",
      api_token: token,
      status: "connected",
      last_checked_at: new Date().toISOString(),
    },
    { onConflict: "user_id,phone_number" }
  );
  if (error) redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?success=Nomor+WA+berhasil+tersambung");
}

export async function recheckDevice(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");

  const { data: device } = await supabase
    .from("wa_devices")
    .select("api_token")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!device) redirect("/dashboard/settings?error=Perangkat+tidak+ditemukan");

  const check = await checkDeviceStatus(device.api_token);
  await supabase
    .from("wa_devices")
    .update({
      status: check.connected ? "connected" : "disconnected",
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
  redirect(
    check.connected
      ? "/dashboard/settings?success=Masih+tersambung"
      : "/dashboard/settings?error=Nomor+WA+terputus.+Sambungkan+ulang+di+dashboard+Fonnte."
  );
}

export async function disconnectDevice(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");

  await supabase.from("wa_devices").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?success=Perangkat+dihapus");
}
