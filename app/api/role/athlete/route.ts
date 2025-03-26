import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { getCurrentUser } from "@/lib/session";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Créer un profil athlète pour l'utilisateur
    await prisma.athlete.create({
      data: {
        userId: user.id,
      },
    });

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "athlete" },
    });

    return NextResponse.redirect(
      new URL("/dashboard/athlete", process.env.NEXT_PUBLIC_APP_URL),
    );
  } catch (error) {
    console.error("Error creating athlete profile:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
