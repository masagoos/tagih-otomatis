"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "magic" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) {
        setErrorMsg(
          error.message.includes("rate limit")
            ? "Batas kirim email tercapai (±2 email/jam). Coba lagi nanti, atau masuk dengan password."
            : error.message
        );
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(
          error.message.includes("Invalid login credentials")
            ? "Email atau password salah."
            : error.message
        );
        setStatus("error");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Tagih Otomatis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pengingat tagihan via WhatsApp, jalan sendiri.
        </p>

        <div className="mt-6 flex rounded-lg bg-gray-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => { setMode("magic"); setStatus("idle"); }}
            className={`flex-1 rounded-md py-1.5 font-medium ${
              mode === "magic" ? "bg-white shadow text-gray-900" : "text-gray-500"
            }`}
          >
            Link Email
          </button>
          <button
            type="button"
            onClick={() => { setMode("password"); setStatus("idle"); }}
            className={`flex-1 rounded-md py-1.5 font-medium ${
              mode === "password" ? "bg-white shadow text-gray-900" : "text-gray-500"
            }`}
          >
            Password
          </button>
        </div>

        {status === "sent" ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Link masuk sudah dikirim ke <strong>{email}</strong>. Buka email
            Anda dan klik link tersebut untuk masuk.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@usaha.com"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            {mode === "password" && (
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">Gagal: {errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {status === "sending"
                ? "Memproses..."
                : mode === "magic"
                ? "Kirim Link Masuk"
                : "Masuk"}
            </button>
            <p className="text-xs text-gray-400">
              {mode === "magic"
                ? "Tanpa password — kami kirim link masuk ke email Anda."
                : "Masuk langsung dengan email dan password."}
            </p>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">
        Dengan masuk, Anda menyetujui{" "}
        <Link href="/syarat-layanan" className="underline hover:text-gray-600">
          Syarat Layanan
        </Link>{" "}
        dan{" "}
        <Link href="/kebijakan-privasi" className="underline hover:text-gray-600">
          Kebijakan Privasi
        </Link>{" "}
        kami.
      </p>
    </main>
  );
}
