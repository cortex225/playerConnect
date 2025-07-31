import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserAPI } from "@/lib/session-api";

/**
 * GET /api/matches/authorized
 * Récupère les matchs publics pour les recruteurs
 */
export async function GET(req: Request) {
  try {
    // 🚀 SOLUTION: Utiliser getCurrentUserAPI() spécialement conçue pour les API routes
    const user = await getCurrentUserAPI();

    if (!user) {
      console.log("Aucune session utilisateur trouvée");
      return NextResponse.json([]);
    }

    if (user.role !== "RECRUITER") {
      console.log(
        `Utilisateur non autorisé ou non recruteur (rôle: ${user.role})`,
      );
      return NextResponse.json([]);
    }

    console.log("Utilisateur récupéré:", user.id, user.role);

    // Récupérer les matchs publics
    const events = await prisma.event.findMany({
      where: {
        isPublic: true, // Uniquement les matchs publics
        // Filtrer pour n'avoir que les événements à venir
        eventDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        eventDate: "asc", // Trier par date croissante
      },
      select: {
        id: true,
        title: true,
        eventDate: true,
        endDate: true,
        location: true,
        description: true,
        isPublic: true,
        athleteId: true,
        athlete: {
          select: {
            id: true,
          },
        },
      },
    });

    console.log("Matchs publics trouvés:", events.length);

    // Formater les dates pour JSON
    const formattedEvents = events.map((event) => ({
      ...event,
      eventDate: event.eventDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    // Retourner un tableau vide au lieu d'une erreur 500
    return NextResponse.json([]);
  }
}
