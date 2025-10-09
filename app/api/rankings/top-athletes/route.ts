import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { SportType } from "@prisma/client";

/**
 * API endpoint pour récupérer les top athletes par sport
 * Cette route calcule dynamiquement les meilleurs athlètes basés sur leurs performances
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport") as SportType | null;
    const limit = parseInt(searchParams.get("limit") || "10");
    const region = searchParams.get("region");
    const country = searchParams.get("country");

    // Si aucun sport n'est spécifié, retourner les top athletes de tous les sports
    const whereClause: any = {};

    if (sport) {
      const sportRecord = await prisma.sport.findUnique({
        where: { name: sport },
      });
      if (sportRecord) {
        whereClause.sportId = sportRecord.id;
      }
    }

    if (region) {
      whereClause.region = region;
    }

    if (country) {
      whereClause.country = country;
    }

    // Récupérer les athlètes avec leurs performances
    const athletes = await prisma.athlete.findMany({
      where: whereClause,
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
            position: {
              select: {
                name: true,
              },
            },
          },
          take: 1, // Prendre seulement la position principale
        },
        performances: {
          orderBy: {
            date: "desc",
          },
          take: 10, // Prendre les 10 dernières performances
          include: {
            stats: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
          orderBy: {
            earnedAt: "desc",
          },
          take: 3, // Top 3 badges
        },
      },
      orderBy: {
        totalScore: "desc",
      },
      take: limit,
    });

    // Formater les données pour le frontend
    const formattedAthletes = athletes.map((athlete, index) => {
      const avgScore =
        athlete.performances.length > 0
          ? athlete.performances.reduce((sum, p) => sum + p.score, 0) /
            athlete.performances.length
          : 0;

      return {
        id: athlete.id,
        rank: index + 1,
        name: athlete.user.name,
        image: athlete.user.image,
        sport: athlete.sport?.name,
        position: athlete.positions[0]?.position.name || "N/A",
        city: athlete.city,
        region: athlete.region,
        country: athlete.country,
        totalScore: athlete.totalScore,
        level: athlete.level,
        xp: athlete.xp,
        averagePerformance: Math.round(avgScore * 10) / 10,
        performancesCount: athlete.performances.length,
        badges: athlete.badges.map((ab) => ({
          name: ab.badge.name,
          icon: ab.badge.icon,
          rarity: ab.badge.rarity,
          earnedAt: ab.earnedAt,
        })),
        recentPerformances: athlete.performances.slice(0, 5).map((p) => ({
          date: p.date,
          score: p.score,
        })),
      };
    });

    return NextResponse.json({
      athletes: formattedAthletes,
      total: formattedAthletes.length,
      sport,
      region,
      country,
    });
  } catch (error) {
    console.error("Error fetching top athletes:", error);
    return NextResponse.json(
      { error: "Failed to fetch top athletes" },
      { status: 500 }
    );
  }
}
