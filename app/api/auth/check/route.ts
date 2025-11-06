import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

/**
 * API endpoint pour vérifier l'état de l'authentification
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ CORRECTION: Utiliser auth.api côté serveur au lieu de authClient
    const headersList = await headers();
    const authSessionResponse = await auth.api.getSession({
      headers: headersList,
    });

    // Vérifier la session avec notre fonction getCurrentUser
    const userSession = await getCurrentUser();

    // Retourner toutes les informations pour le débogage
    return NextResponse.json({
      betterAuthSession: {
        hasSession: !!authSessionResponse?.session,
        hasUser: !!authSessionResponse?.user,
        sessionId: authSessionResponse?.session?.id,
        userKeys: authSessionResponse?.user
          ? Object.keys(authSessionResponse.user)
          : [],
        hasMetadata: !!(authSessionResponse?.user as any)?.user_metadata,
        role: (authSessionResponse?.user as any)?.user_metadata?.role,
      },
      userSession: userSession
        ? {
            id: userSession.id,
            role: userSession.role,
            isLoggedIn: userSession.isLoggedIn,
          }
        : null,
      status: userSession ? "authenticated" : "unauthenticated",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error,
    );
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification de l'authentification",
        status: "error",
      },
      { status: 500 },
    );
  }
}
