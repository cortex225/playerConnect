import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// GET - Get active stories (not expired) from followed users + same sport
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      select: { id: true, sportId: true },
    });

    const now = new Date();

    // Get followed user IDs
    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const followedIds = follows.map((f) => f.followingId);

    // Get stories from followed users + same sport athletes
    let sportUserIds: string[] = [];
    if (athlete?.sportId) {
      const sameAthletes = await prisma.athlete.findMany({
        where: { sportId: athlete.sportId, userId: { not: user.id } },
        select: { userId: true },
        take: 50,
      });
      sportUserIds = sameAthletes.map((a) => a.userId);
    }

    const allTargetIds = Array.from(new Set([...followedIds, ...sportUserIds]));

    // Get active stories grouped by user
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
        userId: { in: allTargetIds.length > 0 ? allTargetIds : undefined },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            athletes: { select: { sport: { select: { name: true } } } },
          },
        },
        views: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also get current user's own stories
    const myStories = await prisma.story.findMany({
      where: { userId: user.id, expiresAt: { gt: now } },
      include: {
        user: { select: { id: true, name: true, image: true } },
        views: { select: { userId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group stories by user
    const storyMap = new Map<string, any>();

    // Add my stories first
    if (myStories.length > 0) {
      storyMap.set(user.id, {
        userId: user.id,
        userName: user.name,
        userImage: user.image,
        isOwn: true,
        stories: myStories.map((s) => ({
          id: s.id,
          mediaUrl: s.mediaUrl,
          type: s.type,
          caption: s.caption,
          createdAt: s.createdAt,
          viewCount: s.views.length,
        })),
        allViewed: true, // Own stories are always "viewed"
      });
    } else {
      // Add "add story" placeholder for current user
      storyMap.set(user.id, {
        userId: user.id,
        userName: user.name,
        userImage: user.image,
        isOwn: true,
        stories: [],
        allViewed: true,
      });
    }

    // Add other users' stories
    for (const story of stories) {
      const uid = story.userId;
      if (!storyMap.has(uid)) {
        storyMap.set(uid, {
          userId: uid,
          userName: story.user.name,
          userImage: story.user.image,
          sport: story.user.athletes?.sport?.name || null,
          isOwn: false,
          stories: [],
          allViewed: true,
        });
      }
      const entry = storyMap.get(uid)!;
      const viewed = story.views.length > 0;
      entry.stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        type: story.type,
        caption: story.caption,
        createdAt: story.createdAt,
        viewed,
      });
      if (!viewed) entry.allViewed = false;
    }

    // Sort: unviewed first, then own, then viewed
    const grouped = Array.from(storyMap.values()).sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      if (a.allViewed !== b.allViewed) return a.allViewed ? 1 : -1;
      return 0;
    });

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("[STORIES_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// POST - Create a new story
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { mediaUrl, type, caption } = await req.json();
    if (!mediaUrl) return NextResponse.json({ error: "mediaUrl requis" }, { status: 400 });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        mediaUrl,
        type: type || "video",
        caption: caption || null,
        expiresAt,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("[STORIES_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
