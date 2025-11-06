import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    console.log("API /athletes/check - Vérification de session en cours");

    // ✅ CORRECTION: Utiliser auth.api côté serveur au lieu de authClient
    const headersList = await headers();
    const authResponse = await auth.api.getSession({
      headers: headersList,
    });
    console.log(
      "API /athletes/check - Session BetterAuth:",
      !!authResponse?.user,
    );

    if (!authResponse?.user) {
      console.log("API /athletes/check - Aucune session BetterAuth");
      return NextResponse.json(
        {
          exists: false,
          error: "Non authentifié",
          authenticated: false,
        },
        { status: 401 },
      );
    }

    // Récupérer l'utilisateur avec notre helper
    const currentUser = await getCurrentUser();
    console.log("API /athletes/check - Session CurrentUser:", !!currentUser);

    if (!currentUser) {
      console.log("API /athletes/check - Aucune session CurrentUser");
      return NextResponse.json(
        {
          exists: false,
          error: "Non authentifié avec getCurrentUser",
          authenticated: false,
        },
        { status: 401 },
      );
    }

    // Récupérer l'ID utilisateur de la requête ou utiliser celui de la session
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || currentUser.id;
    console.log("API /athletes/check - Vérification pour userId:", userId);

    // Vérifier si l'utilisateur demandé est l'utilisateur courant ou si l'utilisateur courant est admin
    if (userId !== currentUser.id && currentUser.role !== "ADMIN") {
      console.log("API /athletes/check - Accès non autorisé");
      return NextResponse.json(
        { error: "Non autorisé à consulter ce profil", exists: false },
        { status: 403 },
      );
    }

    // Vérifier si l'athlète existe
    const athlete = await prisma.athlete.findUnique({
      where: {
        userId: userId,
      },
      select: { id: true },
    });

    console.log("API /athletes/check - Résultat:", !!athlete, athlete?.id);

    return NextResponse.json({
      exists: !!athlete,
      athleteId: athlete?.id || null,
      authenticated: true,
      userId,
    });
  } catch (error) {
    console.error("API /athletes/check - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur", exists: false },
      { status: 500 },
    );
  }
}
