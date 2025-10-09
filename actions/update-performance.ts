"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import {
  addXpToAthlete,
  calculatePerformanceScore,
  checkAndAwardBadges,
  XP_REWARDS,
} from "@/lib/ranking";
import { getCurrentUser } from "@/lib/session";

/**
 * Action serveur pour ajouter une performance et mettre à jour le système de gamification
 */
export async function createPerformanceWithGamification(data: {
  date: Date;
  positionId: string;
  stats: Array<{ key: string; value: number }>;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    // Récupérer l'athlète
    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      include: {
        sport: true,
        positions: {
          include: {
            position: true,
          },
        },
      },
    });

    if (!athlete) {
      return { error: "Profil athlète non trouvé" };
    }

    // Récupérer la position
    const position = await prisma.position.findUnique({
      where: { id: data.positionId },
    });

    if (!position) {
      return { error: "Position non trouvée" };
    }

    // Calculer le score de performance
    const score = calculatePerformanceScore(
      data.stats,
      athlete.sport?.name || "BASKETBALL",
      position.name
    );

    // Créer la performance
    const performance = await prisma.performance.create({
      data: {
        athleteId: athlete.id,
        positionId: data.positionId,
        date: data.date,
        score,
        stats: {
          create: data.stats,
        },
      },
    });

    // Ajouter de l'XP pour avoir ajouté une performance
    await addXpToAthlete(athlete.id, XP_REWARDS.PERFORMANCE_ADDED);

    // Mettre à jour le score total de l'athlète
    const performances = await prisma.performance.findMany({
      where: { athleteId: athlete.id },
    });

    const totalScore =
      performances.reduce((sum, p) => sum + p.score, 0) / performances.length;

    await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        totalScore,
      },
    });

    // Vérifier et attribuer les badges
    await checkAndAwardBadges(athlete.id);

    // TODO: Mettre à jour les rankings
    // await updateRankings(athlete.sportId, 'REGIONAL', 'all-time', athlete.region, athlete.country);

    revalidatePath("/dashboard/athlete");

    return {
      success: true,
      performance,
      message: `Performance ajoutée ! +${XP_REWARDS.PERFORMANCE_ADDED} XP`,
    };
  } catch (error) {
    console.error("Error creating performance:", error);
    return { error: "Erreur lors de l'ajout de la performance" };
  }
}
