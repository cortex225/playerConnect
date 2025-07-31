import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pas d'import auth avec Prisma pour éviter les erreurs Edge Runtime

// Pages qui nécessitent une authentification
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding"];

// Pages accessibles uniquement si non authentifié
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password"];

// Page d'atterrissage après la sélection de rôle
const ROLE_SELECTION_PATH = "/select-role";

// Pages à exclure de la vérification d'authentification (comme les API routes)
const EXCLUDED_ROUTES = [
  "/api/auth",
  "/api/_next",
  "/_next",
  "/favicon.ico",
  "/site.webmanifest",
  "/images",
  "/fonts",
  "/icons",
  "/static",
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
    // Vérifier la présence de cookies de session BetterAuth
    // BetterAuth peut utiliser différents noms de cookies
    const possibleCookieNames = [
      'better-auth.session_token',
      'session_token', 
      'session',
      'auth-token'
    ];
    
    let sessionCookie = null;
    for (const cookieName of possibleCookieNames) {
      const cookie = request.cookies.get(cookieName);
      if (cookie?.value) {
        sessionCookie = cookie;
        break;
      }
    }
    
    const isAuthenticated = !!sessionCookie?.value;
    console.log("[Middleware] Authentifié:", isAuthenticated, sessionCookie ? `(cookie: ${sessionCookie.name})` : '');

    // Pour le moment, on ne peut pas accéder aux détails de l'utilisateur dans le middleware
    // Les informations détaillées seront récupérées côté serveur

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

    // Les détails de l'utilisateur seront ajoutés côté serveur
    // car nous ne pouvons pas accéder à la base de données dans le middleware

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
