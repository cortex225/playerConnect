"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export type EventData = {
  title: string;
  location: string;
  eventDate: Date;
  endDate?: Date | null;
  isPublic: boolean;
  requiresParentalApproval: boolean;
  description?: string;
  color?: string;
};

/**
 * Crée un nouvel événement pour un athlète
 * @param data Les données de l'événement à créer
 * @returns L'événement créé ou une erreur
 */
export async function createEvent(data: EventData) {
  try {
    console.log("Données reçues dans createEvent:", {
      ...data,
      eventDate: data.eventDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    });

    const user = await getCurrentUser();

    if (!user || user.role !== "ATHLETE") {
      return { success: false, error: "Non autorisé" };
    }

    // Récupérer l'ID de l'athlète
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!athlete) {
      return { success: false, error: "Profil athlète non trouvé" };
    }

    // Vérifier que les dates sont valides
    if (!(data.eventDate instanceof Date) || isNaN(data.eventDate.getTime())) {
      return { success: false, error: "Date de début invalide" };
    }

    if (
      data.endDate &&
      (!(data.endDate instanceof Date) || isNaN(data.endDate.getTime()))
    ) {
      return { success: false, error: "Date de fin invalide" };
    }

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        athleteId: athlete.id,
        title: data.title,
        location: data.location,
        eventDate: data.eventDate,
        endDate: data.endDate,
        isPublic: data.isPublic,
        requiresParentalApproval: data.requiresParentalApproval,
        description: data.description,
        color: data.color || "#3b82f6", // Couleur par défaut si non spécifiée
      },
    });

    console.log("Événement créé:", event);

    // Revalider le chemin du calendrier pour mettre à jour l'UI
    revalidatePath("/dashboard/athlete/calendar");
    revalidatePath("/dashboard/athlete");

    return { success: true, data: event };
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return {
      success: false,
      error: "Erreur lors de la création de l'événement",
    };
  }
}

/**
 * Crée un match (type spécifique d'événement) pour un athlète
 * @param data Les données du match à créer
 * @returns Le match créé ou une erreur
 */
export async function createMatch(data: {
  homeTeam: string;
  awayTeam: string;
  location: string;
  gymnasium: string;
  eventDate: Date;
  endDate?: Date | null;
  isPublic: boolean;
  requiresParentalApproval: boolean;
  description?: string;
  color?: string;
}) {
  try {
    // Formater les données pour l'API
    const eventData: EventData = {
      title: `Match: ${data.homeTeam} vs ${data.awayTeam}`,
      location: `${data.gymnasium}, ${data.location}`,
      eventDate: data.eventDate,
      endDate: data.endDate,
      isPublic: data.isPublic,
      requiresParentalApproval: data.requiresParentalApproval,
      description: `Équipe domicile: ${data.homeTeam}\nÉquipe visiteuse: ${data.awayTeam}\n${data.description || ""}`,
      color: data.color,
    };

    // Utiliser la fonction createEvent pour créer l'événement
    return await createEvent(eventData);
  } catch (error) {
    console.error("Erreur lors de la création du match:", error);
    return { success: false, error: "Erreur lors de la création du match" };
  }
}
