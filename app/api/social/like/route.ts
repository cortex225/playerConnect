import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// POST - Toggle like on a media
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { mediaId } = await req.json();
    if (!mediaId) return NextResponse.json({ error: "mediaId requis" }, { status: 400 });

    // Check if already liked
    const existing = await prisma.like.findUnique({
      where: { userId_mediaId: { userId: user.id, mediaId } },
    });

    if (existing) {
      // Unlike
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { mediaId } });
      return NextResponse.json({ liked: false, count });
    }

    // Like
    await prisma.like.create({
      data: { userId: user.id, mediaId },
    });

    // Create activity for media owner
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { athlete: { select: { userId: true } } },
    });

    if (media && media.athlete.userId !== user.id) {
      await prisma.activity.create({
        data: {
          userId: media.athlete.userId,
          actorId: user.id,
          type: "LIKE",
          mediaId,
        },
      });
    }

    const count = await prisma.like.count({ where: { mediaId } });
    return NextResponse.json({ liked: true, count });
  } catch (error) {
    console.error("[LIKE_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// GET - Check if user liked a media + count
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const url = new URL(req.url);
    const mediaId = url.searchParams.get("mediaId");

    if (!mediaId) return NextResponse.json({ error: "mediaId requis" }, { status: 400 });

    const count = await prisma.like.count({ where: { mediaId } });
    let liked = false;

    if (user) {
      const existing = await prisma.like.findUnique({
        where: { userId_mediaId: { userId: user.id, mediaId } },
      });
      liked = !!existing;
    }

    return NextResponse.json({ liked, count });
  } catch (error) {
    console.error("[LIKE_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
