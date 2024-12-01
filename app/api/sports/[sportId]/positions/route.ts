import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { sportId: string } }
) {
  try {
    const positions = await prisma.position.findMany({
      where: {
        sportId: params.sportId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error("[POSITIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
