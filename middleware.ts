import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "./middleware.auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!session && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à la page d'accueil
  if (session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/",
    "/landing",
  ],
};
