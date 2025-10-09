import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { RankingScope, SportType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport") as SportType | null;
    const scope = (searchParams.get("scope") as RankingScope) || "GLOBAL";
    const region = searchParams.get("region");
    const country = searchParams.get("country");
    const period = searchParams.get("period") || "all-time";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!sport) {
      return NextResponse.json(
        { error: "Sport parameter is required" },
        { status: 400 }
      );
    }

    // Construire la clause where
    const whereClause: any = {
      sportId: (
        await prisma.sport.findUnique({ where: { name: sport } })
      )?.id,
      scope,
      period,
    };

    if (scope === "REGIONAL" && region) {
      whereClause.region = region;
    } else if (scope === "NATIONAL" && country) {
      whereClause.country = country;
    }

    // Récupérer les rankings
    const rankings = await prisma.ranking.findMany({
      where: whereClause,
      orderBy: { rank: "asc" },
      take: limit,
      include: {
        athlete: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            sport: {
              select: {
                name: true,
              },
            },
            positions: {
              include: {
                position: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    );
  }
}
