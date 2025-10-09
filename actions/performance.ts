"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { PerformanceFormValues } from "@/types"

export async function createPerformance(data: PerformanceFormValues) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Non autorisé" }
    }

    // Récupérer l'athlète associé à l'utilisateur
    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id }
    })

    if (!athlete) {
      return { error: "Profil athlète non trouvé" }
    }

    // Calculer le score moyen basé sur les statistiques
    const score = data.stats.reduce((acc, stat) => acc + stat.value, 0) / data.stats.length

    await prisma.performance.create({
      data: {
        athleteId: athlete.id,
        date: data.date,
        positionId: data.positionId,
        score: score,
        KPI: {
          createMany: {
            data: data.stats.map(stat => ({
              name: stat.key,
              value: stat.value,
              weight: 1,
              positionId: data.positionId
            }))
          }
        }
      }
    })

    revalidatePath("/dashboard/athlete")
    return { success: true }
  } catch (error) {
    console.error("[CREATE_PERFORMANCE]", error)
    return { error: "Erreur lors de la création de la performance" }
  }
} 