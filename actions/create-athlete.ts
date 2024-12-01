"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";



import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { AthleteFormValues } from "@/lib/validations/athlete";




/**
 * Crée un nouvel athlète en base de données
 * @param data Les informations de l'athlète à créer
 * @returns L'athlète créé ou une erreur si la création a échoué
 */
export async function createAthlete(data: AthleteFormValues) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      throw new Error("Non autorisé");
    }

    // Vérifions d'abord si un athlète existe déjà pour cet utilisateur
    const existingAthlete = await prisma.athlete.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingAthlete) {
      throw new Error("Un profil athlète existe déjà pour cet utilisateur");
    }

    const athlete = await prisma.athlete.create({
      data: {
        userId: user.id, // Ici user.id est garanti d'exister
        gender: data.gender,
        age: data.age,
        city: data.city,
        height: data.height,
        weight: data.weight,
        dominantHand: data.dominantHand,
        dominantFoot: data.dominantFoot,
        programType: data.programType,
        categoryId: data.categoryId,
        sportId: data.sportId,
        positions: {
          create: data.positions.map(positionId => ({
            position: {
              connect: {
                id: positionId
              }
            }
          }))
        }
      },
    });

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ATHLETE" },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");

    return { success: true, data: athlete };
  } catch (error) {
    console.error("Erreur création athlète:", error);
    return { success: false, error: "Erreur lors de la création de l'athlète" };
  }
}