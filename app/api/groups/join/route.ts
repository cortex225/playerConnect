import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { groupId, action } = await req.json();
    if (!groupId) return NextResponse.json({ error: "groupId requis" }, { status: 400 });

    if (action === "leave") {
      await prisma.groupMember.deleteMany({
        where: { groupId, userId: user.id },
      });
      return NextResponse.json({ joined: false });
    }

    // Join
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    });

    if (existing) return NextResponse.json({ joined: true, message: "Deja membre" });

    await prisma.groupMember.create({
      data: { groupId, userId: user.id, role: "MEMBER" },
    });

    return NextResponse.json({ joined: true });
  } catch (error) {
    console.error("[GROUP_JOIN]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
