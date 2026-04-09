import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/recruiter/events
 * Recupere les evenements du calendrier du recruteur (matchs acceptes et en attente)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Recuperer l'ID du recruteur
    const recruiter = await prisma.recruiter.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!recruiter) {
      return NextResponse.json(
        { error: "Profil recruteur non trouve" },
        { status: 404 },
      );
    }

    // Recuperer les invitations acceptees et en attente pour ce recruteur
    const invitations = await prisma.invitation.findMany({
      where: {
        recruiterId: recruiter.id,
        status: { in: ["ACCEPTED", "PENDING"] },
      },
      include: {
        event: {
          include: {
            athlete: {
              include: {
                user: {
                  select: { name: true, image: true },
                },
                sport: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    // Formater les evenements pour FullCalendar
    const events = invitations.map((invitation) => ({
      id: invitation.event.id.toString(),
      title: invitation.event.title,
      start: invitation.event.eventDate.toISOString(),
      end: invitation.event.endDate
        ? invitation.event.endDate.toISOString()
        : undefined,
      location: invitation.event.location,
      description: invitation.event.description,
      color:
        invitation.status === "ACCEPTED" ? "#4f46e5" : "#f59e0b",
      athleteId: invitation.event.athleteId,
      athleteName: invitation.event.athlete.user.name,
      athleteImage: invitation.event.athlete.user.image,
      athleteSport: invitation.event.athlete.sport?.name || null,
      invitationStatus: invitation.status,
      invitationId: invitation.id,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Erreur lors de la recuperation des evenements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des evenements" },
      { status: 500 },
    );
  }
}
