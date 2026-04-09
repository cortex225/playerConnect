import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    // Get start of current week (Monday)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Get all likes from this week, grouped by media owner
    const weeklyLikes = await prisma.like.findMany({
      where: { createdAt: { gte: weekStart } },
      include: {
        media: {
          include: {
            athlete: {
              include: {
                user: { select: { id: true, name: true, image: true } },
                sport: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Aggregate likes per athlete
    const athleteStats = new Map<string, {
      userId: string;
      name: string | null;
      image: string | null;
      sport: string | null;
      likes: number;
      uniqueMediaLiked: Set<string>;
    }>();

    for (const like of weeklyLikes) {
      const athleteUserId = like.media.athlete.user.id;
      if (!athleteStats.has(athleteUserId)) {
        athleteStats.set(athleteUserId, {
          userId: athleteUserId,
          name: like.media.athlete.user.name,
          image: like.media.athlete.user.image,
          sport: like.media.athlete.sport?.name || null,
          likes: 0,
          uniqueMediaLiked: new Set(),
        });
      }
      const stats = athleteStats.get(athleteUserId)!;
      stats.likes++;
      stats.uniqueMediaLiked.add(like.mediaId);
    }

    // Also count followers gained this week
    const weeklyFollows = await prisma.follow.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { followingId: true },
    });

    const followerGains = new Map<string, number>();
    for (const f of weeklyFollows) {
      followerGains.set(f.followingId, (followerGains.get(f.followingId) || 0) + 1);
    }

    // Build leaderboard
    const leaderboard = Array.from(athleteStats.values())
      .map((stats) => ({
        userId: stats.userId,
        name: stats.name,
        image: stats.image,
        sport: stats.sport,
        weeklyLikes: stats.likes,
        weeklyMediaLiked: stats.uniqueMediaLiked.size,
        weeklyNewFollowers: followerGains.get(stats.userId) || 0,
        score: stats.likes * 2 + (followerGains.get(stats.userId) || 0) * 5, // Weighted score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Find current user's position
    const myStats = athleteStats.get(user.id);
    const myRank = leaderboard.findIndex((l) => l.userId === user.id) + 1;

    return NextResponse.json({
      leaderboard,
      myRank: myRank > 0 ? myRank : null,
      myScore: myStats ? myStats.likes * 2 + (followerGains.get(user.id) || 0) * 5 : 0,
      weekStart: weekStart.toISOString(),
    });
  } catch (error) {
    console.error("[LEADERBOARD_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
