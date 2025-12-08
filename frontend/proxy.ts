import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profiel",
  "/instellingen",
  "/mijn-biedingen",
  "/mijn-veilingen",
  "/watchlist",
  "/verkopen",
  "/veilingDashboard",
  "/veilingDisplay",
  "/admin",
  "/verkopen/nieuw",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => {
    if (pathname === path) return true;
    return pathname.startsWith(`${path}/`);
  });

  if (!isProtected) {
    return NextResponse.next();
  }

  // Backend issues HttpOnly cookies named access_token + refresh_token.
  // When neither is present we consider the user unauthenticated.
  const hasSession =
    request.cookies.get("access_token") ?? request.cookies.get("refresh_token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = search ? `${pathname}${search}` : pathname;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profiel/:path*",
    "/instellingen/:path*",
    "/mijn-biedingen/:path*",
    "/mijn-veilingen/:path*",
    "/watchlist/:path*",
    "/verkopen/:path*",
    "/veilingDashboard/:path*",
    "/veilingDisplay/:path*",
    "/admin/:path*",
  ],
};
