import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { storyId } = await req.json();
    if (!storyId) return NextResponse.json({ error: "storyId requis" }, { status: 400 });

    await prisma.storyView.upsert({
      where: { storyId_userId: { storyId, userId: user.id } },
      update: { viewedAt: new Date() },
      create: { storyId, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STORY_VIEW]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
