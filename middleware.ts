import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(req) {
  const session = await auth();
  const cookieStore = req.cookies;
  const roleCookie = cookieStore.get("user_role")?.value;

  // Si l'utilisateur est sur la page d'accueil et est authentifié, rediriger vers son dashboard
  if (req.nextUrl.pathname === "/" && session?.user) {
    const userRole = session.user.role;
    let dashboardPath = "/dashboard";

    switch (roleCookie) {
      case "ADMIN":
        dashboardPath = "/dashboard/admin";
        break;
      case "ATHLETE":
        dashboardPath = "/dashboard/athlete";
        break;
      case "RECRUITER":
        dashboardPath = "/dashboard/recruiter";
        break;
    }

    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

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

  // Vérifier les accès aux dashboards spécifiques
  if (session?.user) {
    const userRole = session.user.role;
    const path = req.nextUrl.pathname;

    // Rediriger si l'utilisateur essaie d'accéder à un dashboard qui n'est pas le sien
    if (path.startsWith("/dashboard/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/" + userRole.toLowerCase(), req.url));
    }
    if (path.startsWith("/dashboard/athlete") && userRole !== "ATHLETE") {
      return NextResponse.redirect(new URL("/dashboard/" + userRole.toLowerCase(), req.url));
    }
    if (path.startsWith("/dashboard/recruiter") && userRole !== "RECRUITER") {
      return NextResponse.redirect(new URL("/dashboard/" + userRole.toLowerCase(), req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/onboarding/:path*"],
};
