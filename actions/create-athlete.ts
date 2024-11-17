"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";



import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { AthleteFormValues } from "@/lib/validations/athlete";





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
        teamName: data.teamName,
        divisionLevel: data.divisionLevel,
        categoryLevel: data.categoryLevel,
        sportId: data.sportId, 
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