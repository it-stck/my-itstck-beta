import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/editor", "/settings", "/onboarding"];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req: NextRequest & { auth: { user?: { id: string; username?: string | null; onboardingCompleted?: boolean } } | null }) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;

  // Handle /@username -> /username redirect (also in next.config.ts for static)
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    return NextResponse.redirect(new URL(`/${username}${nextUrl.search}`, req.url));
  }

  // Protected routes: redirect to login if not authenticated
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes: redirect to dashboard if already logged in
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isLoggedIn) {
    // Redirect to onboarding if not completed
    if (!session.user.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If logged in but onboarding not completed, force onboarding
  if (
    isLoggedIn &&
    !session.user.onboardingCompleted &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/login")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
