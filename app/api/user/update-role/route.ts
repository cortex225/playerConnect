import { NextRequest, NextResponse } from "next/server";

import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// ✅ Rôles valides pour la validation
const VALID_ROLES = [ROLES.ADMIN, ROLES.ATHLETE, ROLES.RECRUITER, ROLES.USER];

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

    // ✅ CORRECTION: Valider que le rôle est autorisé
    const roleUpperCase = role.toUpperCase();
    if (!VALID_ROLES.includes(roleUpperCase)) {
      console.log("[UpdateRole] Rôle invalide:", role);
      return NextResponse.json(
        {
          error: "Rôle invalide",
          validRoles: VALID_ROLES,
        },
        { status: 400 },
      );
    }

    console.log("[UpdateRole] Mise à jour du rôle pour", user.id, "vers", roleUpperCase);

    // Mettre à jour le rôle dans la base de données
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: roleUpperCase },
    });

    // Note: La mise à jour des métadonnées BetterAuth se fera automatiquement
    // via les hooks dans la configuration auth lors du prochain login
    console.log(
      "[UpdateRole] Rôle mis à jour dans la base de données pour",
      user.id,
    );

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
