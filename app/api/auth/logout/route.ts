import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Endpoint pour se déconnecter
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();

    console.log("[Logout] Tentative de déconnexion...");

    // Utiliser l'API BetterAuth pour se déconnecter
    await auth.api.signOut({
      headers: headersList,
    });

    console.log("[Logout] Déconnexion réussie");

    // Pour être sûr de supprimer les cookies côté client
    const response = NextResponse.json({ success: true });

    // ✅ CORRECTION: Utiliser le bon nom de cookie (avec point, pas underscore)
    response.cookies.delete("better-auth.session_token");
    // Supprimer aussi le cookie de rôle sélectionné si présent
    response.cookies.delete("selectedRole");

    return response;
  } catch (error) {
    console.error("[Logout] Erreur lors de la déconnexion:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la déconnexion",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
