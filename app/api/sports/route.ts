import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      include: {
        positions: true
      }
    });
    console.log("Sports retrieved:", sports);
    return NextResponse.json(sports);
  } catch (error) {
    console.error("Erreur lors de la récupération des sports:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sports" },
      { status: 500 },
    );
  }
}
