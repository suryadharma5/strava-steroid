import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth?.user);
  const { pathname } = request.nextUrl;

  const protectedPrefixes = ["/feed", "/progress", "/coach", "/profile"];
  const requiresAuth = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAuthenticated && requiresAuth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/feed/:path*", "/progress/:path*", "/coach/:path*", "/profile/:path*"],
};
