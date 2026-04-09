import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// POST - Toggle follow
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: "targetUserId requis" }, { status: 400 });

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Tu ne peux pas te suivre toi-meme" }, { status: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      const count = await prisma.follow.count({ where: { followingId: targetUserId } });
      return NextResponse.json({ following: false, count });
    }

    await prisma.follow.create({
      data: { followerId: user.id, followingId: targetUserId },
    });

    // Activity notification
    await prisma.activity.create({
      data: {
        userId: targetUserId,
        actorId: user.id,
        type: "FOLLOW",
      },
    });

    const count = await prisma.follow.count({ where: { followingId: targetUserId } });
    return NextResponse.json({ following: true, count });
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// GET - Check follow status + counts
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get("userId");

    if (!targetUserId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

    const followers = await prisma.follow.count({ where: { followingId: targetUserId } });
    const following = await prisma.follow.count({ where: { followerId: targetUserId } });
    let isFollowing = false;

    if (user) {
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
      });
      isFollowing = !!existing;
    }

    return NextResponse.json({ isFollowing, followers, following });
  } catch (error) {
    console.error("[FOLLOW_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
