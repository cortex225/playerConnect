import { prisma } from "@/lib/db";
import type { SportType } from "@prisma/client";

/**
 * Configuration des poids pour chaque KPI par sport et position
 * Ces poids sont utilisés pour calculer le score global de performance
 */
const SPORT_KPI_WEIGHTS: Record<
  string,
  Record<string, Record<string, number>>
> = {
  BASKETBALL: {
    default: {
      points: 0.3,
      rebounds: 0.2,
      assists: 0.2,
      steals: 0.15,
      blocks: 0.15,
    },
    Guard: {
      points: 0.35,
      assists: 0.3,
      steals: 0.2,
      rebounds: 0.1,
      blocks: 0.05,
    },
    Forward: {
      points: 0.3,
      rebounds: 0.3,
      assists: 0.15,
      blocks: 0.15,
      steals: 0.1,
    },
    Center: {
      rebounds: 0.35,
      blocks: 0.25,
      points: 0.25,
      assists: 0.1,
      steals: 0.05,
    },
  },
  FOOTBALL: {
    default: {
      goals: 0.4,
      assists: 0.25,
      shots: 0.15,
      passes: 0.1,
      minutes: 0.1,
    },
    Attaquant: {
      goals: 0.5,
      assists: 0.2,
      shots: 0.2,
      passes: 0.05,
      minutes: 0.05,
    },
    Milieu: {
      assists: 0.35,
      passes: 0.25,
      goals: 0.2,
      shots: 0.1,
      minutes: 0.1,
    },
    Défenseur: {
      passes: 0.3,
      minutes: 0.25,
      assists: 0.2,
      goals: 0.15,
      shots: 0.1,
    },
  },
  SOCCER: {
    default: {
      goals: 0.4,
      assists: 0.25,
      shots: 0.15,
      passes: 0.1,
      minutes: 0.1,
    },
  },
  RUGBY: {
    default: {
      tries: 0.3,
      tackles: 0.25,
      carries: 0.2,
      passes: 0.15,
      meters: 0.1,
    },
  },
};

/**
 * Niveaux de gamification avec seuils XP
 */
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 300 },
  { level: 4, xp: 600 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 1500 },
  { level: 7, xp: 2200 },
  { level: 8, xp: 3000 },
  { level: 9, xp: 4000 },
  { level: 10, xp: 5500 },
  { level: 11, xp: 7500 },
  { level: 12, xp: 10000 },
  { level: 13, xp: 13000 },
  { level: 14, xp: 17000 },
  { level: 15, xp: 22000 },
  { level: 16, xp: 28000 },
  { level: 17, xp: 35000 },
  { level: 18, xp: 44000 },
  { level: 19, xp: 55000 },
  { level: 20, xp: 70000 },
];

/**
 * XP gagnés par action
 */
export const XP_REWARDS = {
  PERFORMANCE_ADDED: 50,
  MEDIA_UPLOADED: 25,
  PROFILE_COMPLETED: 100,
  MATCH_COMPLETED: 75,
  BADGE_EARNED: 150,
  DAILY_LOGIN: 10,
  WEEKLY_CONSISTENCY: 200,
};

/**
 * Calcule le score de performance basé sur les statistiques
 */
export function calculatePerformanceScore(
  stats: Array<{ key: string; value: number }>,
  sportType: SportType,
  positionName?: string
): number {
  const weights =
    SPORT_KPI_WEIGHTS[sportType]?.[positionName || "default"] ||
    SPORT_KPI_WEIGHTS[sportType]?.default ||
    {};

  let totalScore = 0;
  let totalWeight = 0;

  stats.forEach((stat) => {
    const weight = weights[stat.key] || 0;
    if (weight > 0) {
      totalScore += stat.value * weight * 100; // Multiplier par 100 pour avoir des scores plus lisibles
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calcule le niveau basé sur l'XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Calcule l'XP nécessaire pour le prochain niveau
 */
export function getXpForNextLevel(currentLevel: number): number {
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);
  return nextLevel?.xp || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xp;
}

/**
 * Calcule le score total d'un athlète basé sur ses performances récentes
 */
export async function calculateAthleteScore(
  athleteId: number,
  period: "week" | "month" | "quarter" | "year" | "all-time" = "all-time"
): Promise<number> {
  const now = new Date();
  let startDate: Date | undefined;

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarter":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }

  const performances = await prisma.performance.findMany({
    where: {
      athleteId,
      ...(startDate && { date: { gte: startDate } }),
    },
    include: {
      stats: true,
    },
  });

  if (performances.length === 0) return 0;

  // Calculer la moyenne des scores de performance
  const totalScore = performances.reduce(
    (sum, perf) => sum + perf.score,
    0
  );
  const averageScore = totalScore / performances.length;

  // Bonus pour la régularité (plus de performances = meilleur score)
  const consistencyBonus = Math.min(performances.length * 2, 50); // Max 50 points

  return averageScore + consistencyBonus;
}

/**
 * Met à jour les rankings pour un sport donné
 */
export async function updateRankings(
  sportId: string,
  scope: "GLOBAL" | "NATIONAL" | "REGIONAL" | "LOCAL",
  period: string = "all-time",
  region?: string,
  country?: string
) {
  const whereClause: any = { sportId };

  if (scope === "REGIONAL" && region) {
    whereClause.region = region;
  } else if (scope === "NATIONAL" && country) {
    whereClause.country = country;
  } else if (scope === "LOCAL" && region) {
    whereClause.city = region;
  }

  // Récupérer tous les athlètes du sport
  const athletes = await prisma.athlete.findMany({
    where: whereClause,
    include: {
      performances: {
        include: {
          stats: true,
        },
      },
    },
  });

  // Calculer les scores et trier
  const athleteScores = await Promise.all(
    athletes.map(async (athlete) => ({
      athleteId: athlete.id,
      score: await calculateAthleteScore(
        athlete.id,
        period === "all-time" ? "all-time" : "year"
      ),
    }))
  );

  athleteScores.sort((a, b) => b.score - a.score);

  // Mettre à jour ou créer les rankings
  for (let i = 0; i < athleteScores.length; i++) {
    const { athleteId, score } = athleteScores[i];
    const rank = i + 1;

    await prisma.ranking.upsert({
      where: {
        athleteId_sportId_scope_period_region_country: {
          athleteId,
          sportId,
          scope,
          period,
          region: region || null,
          country: country || null,
        },
      },
      update: {
        rank,
        score,
      },
      create: {
        athleteId,
        sportId,
        scope,
        period,
        rank,
        score,
        region,
        country,
      },
    });
  }
}

/**
 * Ajoute de l'XP à un athlète et met à jour son niveau
 */
export async function addXpToAthlete(athleteId: number, xpAmount: number) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
  });

  if (!athlete) throw new Error("Athlete not found");

  const newXp = athlete.xp + xpAmount;
  const newLevel = calculateLevel(newXp);

  await prisma.athlete.update({
    where: { id: athleteId },
    data: {
      xp: newXp,
      level: newLevel,
    },
  });

  // Si le niveau a augmenté, créer une notification
  if (newLevel > athlete.level) {
    await prisma.notification.create({
      data: {
        userId: athlete.userId,
        message: `Félicitations ! Vous avez atteint le niveau ${newLevel} !`,
        athleteId: athlete.id,
      },
    });
  }

  return { newXp, newLevel, leveledUp: newLevel > athlete.level };
}

/**
 * Vérifie et attribue les badges automatiques
 */
export async function checkAndAwardBadges(athleteId: number) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: {
      performances: true,
      badges: {
        include: {
          badge: true,
        },
      },
    },
  });

  if (!athlete) return;

  const earnedBadgeIds = new Set(athlete.badges.map((ab) => ab.badgeId));

  // Récupérer tous les badges disponibles
  const allBadges = await prisma.badge.findMany();

  for (const badge of allBadges) {
    // Si le badge est déjà obtenu, passer
    if (earnedBadgeIds.has(badge.id)) continue;

    let shouldAward = false;

    // Logique d'attribution selon le type de badge
    switch (badge.type) {
      case "MILESTONE":
        if (
          badge.name === "first_performance" &&
          athlete.performances.length >= 1
        ) {
          shouldAward = true;
        } else if (
          badge.name === "10_performances" &&
          athlete.performances.length >= 10
        ) {
          shouldAward = true;
        } else if (
          badge.name === "50_performances" &&
          athlete.performances.length >= 50
        ) {
          shouldAward = true;
        } else if (
          badge.name === "100_performances" &&
          athlete.performances.length >= 100
        ) {
          shouldAward = true;
        }
        break;

      case "PERFORMANCE":
        // Vérifier les performances exceptionnelles
        const topPerformance = Math.max(
          ...athlete.performances.map((p) => p.score),
          0
        );
        if (badge.name === "top_performer" && topPerformance >= 90) {
          shouldAward = true;
        }
        break;

      case "CONSISTENCY":
        // Vérifier la régularité (au moins 1 performance par semaine sur un mois)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const recentPerformances = athlete.performances.filter(
          (p) => p.date >= lastMonth
        );
        if (badge.name === "consistent_player" && recentPerformances.length >= 4) {
          shouldAward = true;
        }
        break;
    }

    if (shouldAward) {
      await prisma.athleteBadge.create({
        data: {
          athleteId: athlete.id,
          badgeId: badge.id,
        },
      });

      // Ajouter l'XP du badge
      await addXpToAthlete(athleteId, badge.xpReward);

      // Créer une notification
      await prisma.notification.create({
        data: {
          userId: athlete.userId,
          message: `Nouveau badge débloqué : ${badge.name} ! +${badge.xpReward} XP`,
          athleteId: athlete.id,
        },
      });
    }
  }
}
