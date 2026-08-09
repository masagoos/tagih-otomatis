import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: proxy.ts (pengganti middleware.ts).
// Tugas: refresh session Supabase + proteksi halaman aplikasi.
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Penting: jangan ada kode di antara createServerClient dan getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Tangkap kode referral affiliate (?ref=CODE) begitu ada di URL manapun,
  // simpan 30 hari — dipakai saat onboarding untuk menautkan pengguna baru
  // ke affiliate yang mereferensikannya (lihat completeProfile). withRef()
  // memastikan cookie ini ikut terbawa walau proxy ini akhirnya redirect,
  // bukan cuma saat request diteruskan apa adanya.
  const refCode = request.nextUrl.searchParams.get("ref");
  function withRef(res: NextResponse) {
    if (refCode) {
      res.cookies.set("tagih_ref", refCode, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return res;
  }

  // Jaring pengaman: kalau callback auth Supabase (?code=...) mendarat di
  // halaman selain /auth/confirm (mis. jatuh ke Site URL "/"), arahkan ke
  // route confirm agar code sempat ditukar jadi session — jangan sampai hangus.
  if (request.nextUrl.searchParams.has("code") && path !== "/auth/confirm") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return withRef(NextResponse.redirect(url));
  }
  const isProtected = path.startsWith("/dashboard");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return withRef(NextResponse.redirect(url));
  }

  if ((path === "/login" || path === "/") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return withRef(NextResponse.redirect(url));
  }

  return withRef(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
