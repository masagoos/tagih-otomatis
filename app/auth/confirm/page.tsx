"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Sengaja diproses di sini (client-side, bukan route handler server) —
// link email sering "diklik" duluan oleh pemindai keamanan email
// (Gmail/Outlook link-scanning) sebelum penggunanya sendiri sempat klik.
// Pemindai itu cuma fetch HTTP biasa, tidak menjalankan JavaScript, jadi
// token OTP baru benar-benar dipakai saat browser asli membuka halaman ini.
export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const token_hash = params.get("token_hash");
      const type = params.get("type") as EmailOtpType | null;

      const supabase = createClient();

      // Kalau sudah login (mis. tab lama dibuka lagi lewat tombol back
      // browser setelah link ini sukses dipakai sebelumnya), langsung ke
      // dashboard — jangan coba pakai ulang link yang sudah kedaluwarsa.
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });
        if (!error) {
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }

      setErrorMsg(
        "Link login sudah kedaluwarsa atau sudah pernah dipakai. Ini bisa terjadi kalau link sudah lama, sudah pernah diklik sebelumnya, atau dibuka lewat aplikasi email yang otomatis memindai link demi keamanan."
      );
      setStatus("error");
    }

    run();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow">
        {status === "checking" ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900">Memverifikasi login…</h1>
            <p className="mt-2 text-sm text-gray-500">Mohon tunggu sebentar.</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-900">Link Login Gagal</h1>
            <p className="mt-2 text-sm text-gray-600">{errorMsg}</p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Minta Link Baru
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
