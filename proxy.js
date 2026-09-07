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

// Only /dashboard and its sub-routes are gated; public pages, _next/*,
// and files in /public never hit this proxy.
export const config = {
  matcher: ["/dashboard/:path*"],
};
