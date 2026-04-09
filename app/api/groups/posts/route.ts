import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { moderateContent, sanitizeContent } from "@/lib/moderation";

// GET posts for a group
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const url = new URL(req.url);
    const groupId = url.searchParams.get("groupId");
    if (!groupId) return NextResponse.json({ error: "groupId requis" }, { status: 400 });

    // Check membership
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Non membre" }, { status: 403 });

    const posts = await prisma.groupPost.findMany({
      where: { groupId, isFlagged: false },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[GROUP_POSTS_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// POST a message in a group
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { groupId, content, mediaUrl } = await req.json();
    if (!groupId || !content?.trim()) {
      return NextResponse.json({ error: "groupId et content requis" }, { status: 400 });
    }

    // Check membership
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Non membre" }, { status: 403 });

    // Moderate
    const moderation = await moderateContent(content);
    if (moderation.isBlocked) {
      return NextResponse.json({ error: "Contenu interdit", blocked: true }, { status: 400 });
    }

    const post = await prisma.groupPost.create({
      data: {
        groupId,
        userId: user.id,
        content: sanitizeContent(content.trim()),
        mediaUrl: mediaUrl || null,
        isFlagged: moderation.isSuspicious,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[GROUP_POSTS_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
