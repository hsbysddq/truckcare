import { NextResponse } from "next/server";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

// Proteksi /dashboard dan API pengaturan. Refresh session via Supabase Auth
// (bukan cookie flag dummy). Publik / API lain (dibaca langsung dari
// Supabase via anon + RLS), halaman publik, _next/*, dan /public tidak kena.
export async function proxy(request) {
  let response = NextResponse.next();

  // Env Supabase kosong (mis. .env.local belum dibuat): tidak ada cara
  // memverifikasi sesi, arahkan ke /login yang menampilkan pesan jelas.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.cookies.toString());
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session + buat cookie kalau token hampir kedaluwarsa.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// Rute yang butuh session Supabase: dashboard, API pengaturan, API analitik,
// riwayat chat, dan aktivitas agent.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/pengaturan/:path*",
    "/api/analytics/:path*",
    "/api/chat/:path*",
    "/api/agent-activity/:path*",
    "/api/schedules/:path*",
  ],
};
