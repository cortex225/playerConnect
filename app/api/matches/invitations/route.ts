import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/matches/invitations
 * Récupère les invitations aux matchs pour l'athlète
 * Query params:
 * - status: PENDING, ACCEPTED, REJECTED (optionnel)
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ATHLETE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Récupérer l'ID de l'athlète
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Profil athlète non trouvé" },
        { status: 404 },
      );
    }

    // Construire la requête pour récupérer les invitations
    const whereClause: any = {
      event: {
        athleteId: athlete.id,
      },
    };

    // Filtrer par statut si spécifié
    if (status) {
      whereClause.status = status;
    }

    // Récupérer les invitations
    const invitations = await prisma.invitation.findMany({
      where: whereClause,
      include: {
        event: true,
        recruiter: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // Formater les invitations pour le frontend
    const formattedInvitations = invitations.map((invitation) => ({
      id: invitation.id,
      eventId: invitation.eventId,
      recruiterId: invitation.recruiterId,
      status: invitation.status,
      sentAt: invitation.sentAt.toISOString(),
      recruiterName: invitation.recruiter.user.name || "Recruteur anonyme",
      event: {
        id: invitation.event.id,
        title: invitation.event.title,
        eventDate: invitation.event.eventDate.toISOString(),
        endDate: invitation.event.endDate
          ? invitation.event.endDate.toISOString()
          : null,
        location: invitation.event.location,
        description: invitation.event.description,
      },
    }));

    return NextResponse.json(formattedInvitations);
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 },
    );
  }
}
