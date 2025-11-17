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

  const hasAuthCookie = request.cookies.get("auth");

  if (!hasAuthCookie) {
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

