import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export function proxy(request) {
  if (request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(loginUrl);
}

// /dashboard, API pengaturan, dan API riwayat chat digate; API publik lain
// (dibaca langsung dari Supabase via anon + RLS), halaman publik, _next/*,
// dan file di /public tidak kena proxy ini.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/pengaturan/:path*",
    "/api/chat/:path*",
    "/api/analytics/:path*",
  ],
};
