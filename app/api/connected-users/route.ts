// app/api/connected-users/route.ts
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { isOnline: true },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur API /connected-users :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
