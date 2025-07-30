import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

// Pages qui nécessitent une authentification
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding"];

// Pages accessibles uniquement si non authentifié
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password"];

// Page d'atterrissage après la sélection de rôle
const ROLE_SELECTION_PATH = "/select-role";

// Pages à exclure de la vérification d'authentification (comme les API routes)
const EXCLUDED_ROUTES = [
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/images",
  "/fonts",
];

// Fonction pour vérifier si une route doit être exclue
const isExcludedRoute = (path: string) => {
  return EXCLUDED_ROUTES.some((route) => path.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne pas traiter les routes exclues
  if (isExcludedRoute(pathname)) {
    return NextResponse.next();
  }

  console.log("[Middleware] URL:", pathname);

  try {
    // Obtenir la session via l'API de BetterAuth
    console.log("[Middleware] Vérification de session avec headers");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const isAuthenticated = !!session?.user;
    console.log("[Middleware] Authentifié:", isAuthenticated);

    if (session?.user) {
      // Log sécurisé pour éviter d'afficher trop d'informations sensibles
      console.log("[Middleware] User ID:", session.user.id);
      // Log des métadonnées disponibles
      if ((session.user as any).user_metadata) {
        console.log(
          "[Middleware] User Role from metadata:",
          (session.user as any).user_metadata.role,
        );
      }
      if ((session.user as any).role) {
        console.log(
          "[Middleware] User Role from DB:",
          (session.user as any).role,
        );
      }
    }

    // Vérifier si l'utilisateur essaie d'accéder à une route protégée
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    // Vérifier si l'utilisateur essaie d'accéder à une route d'authentification
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

    // Rediriger vers la page de connexion si l'utilisateur tente d'accéder
    // à une route protégée sans être authentifié
    if (isProtectedRoute && !isAuthenticated) {
      console.log("[Middleware] Non authentifié, redirection vers /auth/login");
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rediriger vers le tableau de bord si l'utilisateur est authentifié
    // et tente d'accéder à une route d'authentification
    if (isAuthRoute && isAuthenticated) {
      console.log("[Middleware] Déjà authentifié, redirection vers /dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Si l'utilisateur est sur la page d'accueil et est authentifié,
    // le rediriger vers le tableau de bord
    if (pathname === "/" && isAuthenticated) {
      console.log(
        "[Middleware] Authentifié à la racine, redirection vers /dashboard",
      );
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Pour les routes nécessitant un rôle spécifique, vérifier si l'utilisateur
    // a les permissions nécessaires (à implémenter selon les besoins)

    // Ajouter le pathname aux headers pour le récupérer dans les layouts
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);

    // Ajouter l'état d'authentification comme header pour les layouts
    response.headers.set("x-authenticated", isAuthenticated ? "true" : "false");

    // Si l'utilisateur est authentifié, ajouter son ID pour référence
    if (isAuthenticated && session?.user) {
      response.headers.set("x-user-id", session.user.id);

      // Ajouter le rôle si disponible
      const role =
        (session.user as any).user_metadata?.role || (session.user as any).role;
      if (role) {
        response.headers.set("x-user-role", role);
      }
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Erreur:", error);

    // En cas d'erreur d'authentification, nous continuons la requête
    // mais ajoutons un header pour indiquer l'erreur
    const response = NextResponse.next();
    response.headers.set("x-auth-error", "true");

    // Si c'est une route protégée, rediriger vers la page de connexion par sécurité
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    if (isProtectedRoute) {
      console.log("[Middleware] Erreur d'authentification sur route protégée");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return response;
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
