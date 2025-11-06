import { NextResponse } from "next/server";

import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Créer un profil recruteur pour l'utilisateur
    await prisma.recruiter.create({
      data: {
        userId: user.id,
      },
    });

    // ✅ CORRECTION CRITIQUE: Mettre à jour le rôle en MAJUSCULES
    await prisma.user.update({
      where: { id: user.id },
      data: { role: ROLES.RECRUITER },
    });

    return NextResponse.redirect(
      new URL("/dashboard/recruiter", process.env.NEXT_PUBLIC_APP_URL),
    );
  } catch (error) {
    console.error("Error creating recruiter profile:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
