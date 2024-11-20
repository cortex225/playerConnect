"use server";
import { prisma } from "@/lib/db";

export async function getAllAthletes() {
  try {
    const athletes = await prisma.athlete.findMany({
      include: {
        user: true, // Inclure les informations de l'utilisateur associé
        sport: true, // Inclure les informations du sport associé
      },
    });
    return athletes;
  } catch (error) {
    console.error("Erreur lors de la récupération des athlètes:", error);
    throw new Error("Erreur lors de la récupération des athlètes");
  }
}

export async function getAthleteById(id: number) {
  try {
    const athlete = await prisma.athlete.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true, // Inclure les informations de l'utilisateur associé
        sport: true, // Inclure les informations du sport associé
      },
    });
    return athlete;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'athlète:", error);
    throw new Error("Erreur lors de la récupération de l'athlète");
  }
}
