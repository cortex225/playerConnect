"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function createPerformance(values: {
  date: Date;
  positionId: string;
  stats: Array<{ key: string; value: number }>;
}) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    // Récupérer l'athlète associé à l'utilisateur
    const athlete = await prisma.athlete.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!athlete) {
      throw new Error("Athlète non trouvé");
    }

    // Calculer le score moyen basé sur les statistiques
    const score =
      values.stats.reduce((acc, stat) => acc + stat.value, 0) /
      values.stats.length;

    // Créer la performance
    const performance = await prisma.performance.create({
      data: {
        date: values.date,
        positionId: values.positionId,
        athleteId: athlete.id,
        score: score,
        stats: {
          create: values.stats.map((stat) => ({
            key: stat.key,
            value: stat.value,
          })),
        },
      },
    });
    console.log("Performance created", performance);

    return performance;
  } catch (error) {
    console.error("[CREATE_PERFORMANCE]", error);
    throw error;
  }
}
