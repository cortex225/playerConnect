import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * API pour mettre à jour le rôle d'un utilisateur
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur est authentifié
    const user = await getCurrentUser();

    if (!user) {
      console.log("[UpdateRole] Non authentifié");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données du corps de la requête
    const data = await request.json();
    const { role, provider } = data;

    if (!role) {
      return NextResponse.json(
        { error: "Le rôle est requis" },
        { status: 400 },
      );
    }

    console.log("[UpdateRole] Mise à jour du rôle pour", user.id, "vers", role);

    // Mettre à jour le rôle dans la base de données
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: role.toUpperCase() },
    });

    // Mettre à jour les métadonnées dans BetterAuth
    try {
      // On utilise l'API de BetterAuth pour mettre à jour les métadonnées
      const result = await auth.api.updateUserMetadata({
        body: {
          userId: user.id,
          metadata: {
            role: role.toUpperCase(),
          },
        },
        headers: headers(),
      });

      console.log("[UpdateRole] Métadonnées mises à jour pour", user.id);
    } catch (error) {
      console.error("[UpdateRole] Erreur mise à jour métadonnées:", error);
      // On continue même en cas d'erreur car la DB est mise à jour
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("[UpdateRole] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour du rôle",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
