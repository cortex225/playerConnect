import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default async function middleware(req) {
  const session = await auth();
  const cookieStore = req.cookies;
  const roleCookie = cookieStore.get("user_role")?.value;

  // Protection des routes du dashboard
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/landing", req.url));
    }

    // Redirection de /dashboard vers le bon dashboard en fonction du rôle
    if (req.nextUrl.pathname === "/dashboard") {
      const dashboardPath =
        roleCookie === "ATHLETE"
          ? "/dashboard/athlete"
          : "/dashboard/recruiter";
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }

    // Vérification du rôle pour les routes spécifiques
    if (
      req.nextUrl.pathname.startsWith("/dashboard/athlete") &&
      roleCookie !== "ATHLETE"
    ) {
      return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
    }

    if (
      req.nextUrl.pathname.startsWith("/dashboard/recruiter") &&
      roleCookie !== "RECRUITER"
    ) {
      return NextResponse.redirect(new URL("/dashboard/athlete", req.url));
    }
  }

  // Protection de la route onboarding
  if (req.nextUrl.pathname.startsWith("/onboarding")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/landing", req.url));
    }

    // Seuls les athlètes peuvent accéder à l'onboarding
    if (roleCookie !== "ATHLETE") {
      return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
    }
  }

  // Redirection de la page d'accueil si déjà connecté
  if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/landing") {
    if (session?.user) {
      const dashboardPath =
        roleCookie === "ATHLETE"
          ? "/dashboard/athlete"
          : "/dashboard/recruiter";
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    } else {
      if (req.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/landing", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/onboarding/:path*"],
};
