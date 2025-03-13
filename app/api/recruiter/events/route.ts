import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/recruiter/events
 * Récupère les événements du calendrier du recruteur (matchs acceptés)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'ID du recruteur
    const recruiter = await prisma.recruiter.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!recruiter) {
      return NextResponse.json(
        { error: "Profil recruteur non trouvé" },
        { status: 404 },
      );
    }

    // Récupérer les invitations acceptées pour ce recruteur
    const invitations = await prisma.invitation.findMany({
      where: {
        recruiterId: recruiter.id,
        status: "ACCEPTED", // Uniquement les invitations acceptées
      },
      include: {
        event: {
          include: {
            athlete: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Formater les événements pour FullCalendar
    const events = invitations.map((invitation) => ({
      id: invitation.event.id.toString(),
      title: invitation.event.title,
      start: invitation.event.eventDate.toISOString(),
      end: invitation.event.endDate
        ? invitation.event.endDate.toISOString()
        : undefined,
      location: invitation.event.location,
      description: invitation.event.description,
      color: "#4f46e5", // Couleur par défaut pour les événements du recruteur
      athleteId: invitation.event.athleteId,
      athleteName: invitation.event.athlete.user.name,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 },
    );
  }
}
