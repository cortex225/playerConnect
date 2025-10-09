import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "User ID requis" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        isOnline: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du statut utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
