import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { moderateContent, sanitizeContent } from "@/lib/moderation";

// GET - Get comments for a media
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mediaId = url.searchParams.get("mediaId");
    if (!mediaId) return NextResponse.json({ error: "mediaId requis" }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { mediaId, isFlagged: false },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// POST - Add comment (with moderation)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { mediaId, content } = await req.json();
    if (!mediaId || !content?.trim()) {
      return NextResponse.json({ error: "mediaId et content requis" }, { status: 400 });
    }

    // Moderate content
    const moderation = await moderateContent(content);
    if (moderation.isBlocked) {
      return NextResponse.json(
        { error: "Ton commentaire contient du contenu interdit.", blocked: true },
        { status: 400 }
      );
    }

    const sanitized = sanitizeContent(content.trim());

    const comment = await prisma.comment.create({
      data: {
        content: sanitized,
        userId: user.id,
        mediaId,
        isModerated: true,
        isFlagged: moderation.isSuspicious,
        flagReason: moderation.isSuspicious ? moderation.reasons.join(", ") : null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Activity for media owner
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { athlete: { select: { userId: true } } },
    });

    if (media && media.athlete.userId !== user.id) {
      await prisma.activity.create({
        data: {
          userId: media.athlete.userId,
          actorId: user.id,
          type: "COMMENT",
          mediaId,
        },
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
