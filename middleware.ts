import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default async function middleware(req) {
  const session = await auth(); // Récupère la session utilisateur
  const cookieStore = req.cookies; // Accède aux cookies
  const roleCookie = cookieStore.get("user_role")?.value; // Récupère le rôle depuis les cookies

  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/admin");

  // Si l'utilisateur n'est pas authentifié, bloquer l'accès aux routes protégées
  if (!session?.user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Restreindre l'accès à l'admin uniquement aux utilisateurs avec le rôle ADMIN
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Si l'utilisateur est USER, vérifier les cookies pour afficher la modale
  if (
    session?.user?.role === "USER" &&
    (roleCookie === "ATHLETE" || roleCookie === "RECRUITER")
  ) {
    if (roleCookie === "ATHLETE") {
      return NextResponse.redirect(new URL("/dashboard-athlete", req.url));
    }
    if (roleCookie === "RECRUITER") {
      return NextResponse.redirect(new URL("/dashboard-recruiter", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/onboarding/:path*"],
};
