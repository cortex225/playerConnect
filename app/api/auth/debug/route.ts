import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { getServerSession } from "@/lib/server/session";

/**
 * Endpoint de débogage pour afficher l'état de l'authentification
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    console.log("[Auth Debug] Récupération des headers");

    // Récupérer la session via l'API server-side
    console.log("[Auth Debug] Récupération de session via auth.api.getSession");
    let serverSession: any = null;
    let serverSessionError: any = null;

    try {
      serverSession = await auth.api.getSession({
        headers: headersList,
      });
    } catch (error) {
      console.error(
        "[Auth Debug] Erreur lors de la récupération de session server-side:",
        error,
      );
      serverSessionError = {
        message: (error as Error).message,
        name: (error as Error).name,
      };
    }

    // Récupérer la session via notre helper
    console.log("[Auth Debug] Récupération de session via getServerSession");
    let userSession: any = null;
    let userSessionError: any = null;

    try {
      userSession = await getServerSession();
    } catch (error) {
      console.error(
        "[Auth Debug] Erreur lors de la récupération de session via getServerSession:",
        error,
      );
      userSessionError = {
        message: (error as Error).message,
        name: (error as Error).name,
      };
    }

    // Vérifier les cookies
    const cookies = request.cookies;
    const sessionCookie = cookies.get("better_auth_session_token");

    // Créer l'objet de réponse
    const responseObj: any = {
      environment: {
        isProduction: process.env.NODE_ENV === "production",
        betterAuthUrl: process.env.BETTER_AUTH_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
      cookies: {
        hasSessionCookie: !!sessionCookie,
        sessionCookieValue: sessionCookie ? "[HIDDEN FOR SECURITY]" : null,
        allCookies: cookies.getAll().map((c) => c.name),
      },
      status: userSession ? "authenticated" : "unauthenticated",
    };

    // Ajouter les informations de session serveur si disponibles
    if (serverSession) {
      responseObj.serverSession = {
        hasSession: !!serverSession?.session,
        hasUser: !!serverSession?.user,
        sessionId: serverSession?.session?.id,
        userId: serverSession?.user?.id,
        userEmail: serverSession?.user?.email,
        userDetails: serverSession?.user
          ? {
              id: serverSession.user.id,
              email: serverSession.user.email,
              name: serverSession.user.name,
              role: (serverSession.user as any).role,
              hasMetadata: !!(serverSession.user as any).user_metadata,
              metadata: (serverSession.user as any).user_metadata,
            }
          : null,
      };
    }

    // Ajouter les erreurs si présentes
    if (serverSessionError) {
      responseObj.serverSessionError = serverSessionError;
    }

    // Ajouter la session utilisateur si disponible
    if (userSession) {
      responseObj.userSession = userSession;
    }

    // Ajouter les erreurs de session utilisateur si présentes
    if (userSessionError) {
      responseObj.userSessionError = userSessionError;
    }

    return NextResponse.json(responseObj);
  } catch (error) {
    console.error("[Auth Debug] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du débogage de l'authentification",
        message: (error as Error).message,
        status: "error",
      },
      { status: 500 },
    );
  }
}
