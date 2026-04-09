import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get current athlete's sport and category for recommendation
    const currentAthlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      select: { id: true, sportId: true, categoryId: true },
    });

    // Build the feed query with recommendation scoring
    // Priority: 1) Same sport, 2) Same category, 3) Recent
    const medias = await prisma.media.findMany({
      where: currentAthlete ? {
        athleteId: { not: currentAthlete.id }, // Exclude own media
      } : {},
      include: {
        athlete: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            sport: {
              select: { name: true },
            },
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      // Fetch more than needed to allow reordering
      take: limit * 3,
      skip: skip > 0 ? skip : 0,
    });

    // Score and sort by relevance
    const scored = medias.map((media) => {
      let score = 0;
      if (currentAthlete) {
        // Same sport = highest priority
        if (media.athlete.sportId === currentAthlete.sportId) score += 100;
        // Same category = medium priority
        if (media.athlete.categoryId === currentAthlete.categoryId) score += 50;
      }
      // Recency bonus (newer = higher score, max 30 points)
      const ageInDays = (Date.now() - new Date(media.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - ageInDays);

      return { ...media, _score: score };
    });

    // Sort by score descending, then take the limit
    scored.sort((a, b) => b._score - a._score);
    const feed = scored.slice(0, limit);

    // Format response
    const formattedFeed = feed.map(({ _score, ...media }) => ({
      id: media.id,
      title: media.title,
      description: media.description,
      url: media.url,
      type: media.type,
      createdAt: media.createdAt,
      athlete: {
        id: media.athlete.id,
        userId: media.athlete.user.id,
        name: media.athlete.user.name,
        image: media.athlete.user.image,
        sport: media.athlete.sport?.name || null,
        category: media.athlete.category?.name || null,
      },
    }));

    // Add like/comment counts
    const safeCount = async (promise: Promise<number>) => {
      try { return await promise; } catch { return 0; }
    };

    const feedWithCounts = await Promise.all(
      formattedFeed.map(async (item) => {
        const [likeCount, commentCount] = await Promise.all([
          safeCount(prisma.like.count({ where: { mediaId: item.id } })),
          safeCount(prisma.comment.count({ where: { mediaId: item.id, isFlagged: false } })),
        ]);
        let isLiked = false;
        try {
          if (user) {
            const like = await prisma.like.findUnique({
              where: { userId_mediaId: { userId: user.id, mediaId: item.id } },
            });
            isLiked = !!like;
          }
        } catch {}
        return { ...item, likeCount, commentCount, isLiked };
      })
    );

    const hasMore = medias.length >= limit;

    return NextResponse.json({
      feed: feedWithCounts,
      page,
      hasMore,
    });
  } catch (error) {
    console.error("[FEED_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
