import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client dengan service_role — bypass RLS.
// HANYA untuk worker cron & webhook di server. Jangan impor dari kode client.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
