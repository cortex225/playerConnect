import { NextRequest, NextResponse } from "next/server";

import { authClient } from "@/lib/auth-client";
import { getCurrentUser } from "@/lib/session";

/**
 * API endpoint pour vérifier l'état de l'authentification
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier la session directement avec authClient
    const authSessionResponse = await authClient.getSession();

    // Vérifier la session avec notre fonction getCurrentUser
    const userSession = await getCurrentUser();

    // Retourner toutes les informations pour le débogage
    return NextResponse.json({
      betterAuthSession: {
        hasSession: !!authSessionResponse?.data?.session,
        hasUser: !!authSessionResponse?.data?.user,
        sessionId: authSessionResponse?.data?.session?.id,
        userKeys: authSessionResponse?.data?.user
          ? Object.keys(authSessionResponse.data.user)
          : [],
        hasMetadata: !!(authSessionResponse?.data?.user as any)?.user_metadata,
        role: (authSessionResponse?.data?.user as any)?.user_metadata?.role,
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
