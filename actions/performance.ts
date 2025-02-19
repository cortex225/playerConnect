"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"
import { PerformanceFormValues } from "@/types"

export async function createPerformance(athleteId: number, data: PerformanceFormValues) {
  try {
    await prisma.performance.create({
      data: {
        athleteId,
        date: data.date,
        positionId: data.positionId,
        score: 0, // Calculer le score en fonction des stats
        KPI: {
          createMany: {
            data: data.stats.map(stat => ({
              name: stat.key,
              value: stat.value,
              weight: 1, // À ajuster selon vos besoins
              positionId: data.positionId
            }))
          }
        }
      }
    })
    
    revalidatePath("/dashboard/athlete")
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la création de la performance" }
  }
} 