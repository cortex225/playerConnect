import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * POST /api/matches/invite
 * Permet à un recruteur de demander à assister à un match
 */
export async function POST(request: Request) {
  try {
    console.log("Début de la requête POST /api/matches/invite");

    const user = await getCurrentUser();
    console.log("Utilisateur connecté:", user?.id, user?.role);

    if (!user || user.role !== "RECRUITER") {
      console.log("Utilisateur non autorisé:", user?.role);
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Corps de la requête:", body);

    const { eventId, athleteId } = body;

    if (!eventId || !athleteId) {
      console.log("Paramètres manquants:", { eventId, athleteId });
      return NextResponse.json(
        { error: "eventId et athleteId sont requis" },
        { status: 400 },
      );
    }

    // Vérifier que l'événement existe
    console.log("Recherche de l'événement:", eventId);
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        athlete: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      console.log("Événement non trouvé:", eventId);
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 },
      );
    }
    console.log("Événement trouvé:", event.id, event.title);

    // Récupérer le recruteur
    console.log("Recherche du recruteur pour l'utilisateur:", user.id);
    const recruiter = await prisma.recruiter.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!recruiter) {
      console.log("Profil recruteur non trouvé pour l'utilisateur:", user.id);
      return NextResponse.json(
        { error: "Profil recruteur non trouvé" },
        { status: 404 },
      );
    }
    console.log("Recruteur trouvé:", recruiter.id);

    // Vérifier si une invitation existe déjà
    console.log(
      "Vérification d'une invitation existante:",
      eventId,
      recruiter.id,
    );
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        eventId,
        recruiterId: recruiter.id,
      },
    });

    if (existingInvitation) {
      console.log("Invitation existante trouvée:", existingInvitation.id);
      return NextResponse.json(
        { error: "Une invitation existe déjà pour ce match" },
        { status: 400 },
      );
    }

    // Créer l'invitation
    console.log("Création d'une nouvelle invitation");
    const invitation = await prisma.invitation.create({
      data: {
        eventId,
        recruiterId: recruiter.id,
        isIncognito: false,
        status: "PENDING", // En attente de confirmation
      },
    });
    console.log("Invitation créée:", invitation.id);

    // Créer une notification pour l'athlète
    console.log(
      "Création d'une notification pour l'athlète:",
      event.athlete.user.id,
    );
    await prisma.notification.create({
      data: {
        userId: event.athlete.user.id, // L'ID de l'utilisateur de l'athlète
        message: `Le recruteur ${user.name || "Un recruteur"} souhaite assister à votre match "${event.title}" le ${new Date(event.eventDate).toLocaleDateString()}`,
        athleteId: event.athleteId, // ID de l'athlète
        recruiterId: recruiter.id, // ID du recruteur
      },
    });
    console.log("Notification créée avec succès");

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error("Erreur lors de la création de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'invitation" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/matches/invite
 * Permet à un athlète d'accepter ou refuser une invitation
 */
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ATHLETE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId, status } = body;

    if (!invitationId || !status) {
      return NextResponse.json(
        { error: "invitationId et status sont requis" },
        { status: 400 },
      );
    }

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Le statut doit être ACCEPTED ou REJECTED" },
        { status: 400 },
      );
    }

    // Récupérer l'athlète
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

    // Vérifier que l'invitation existe et appartient à l'athlète
    const invitation = await prisma.invitation.findUnique({
      where: {
        id: invitationId,
      },
      include: {
        event: true,
        recruiter: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 },
      );
    }

    if (invitation.event.athleteId !== athlete.id) {
      return NextResponse.json(
        { error: "Cette invitation ne vous concerne pas" },
        { status: 403 },
      );
    }

    // Mettre à jour le statut de l'invitation
    const updatedInvitation = await prisma.invitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status,
      },
    });

    // Créer une notification pour le recruteur
    await prisma.notification.create({
      data: {
        userId: invitation.recruiter.user.id, // L'ID de l'utilisateur du recruteur
        message: `L'athlète ${user.name || "Un athlète"} a ${
          status === "ACCEPTED" ? "accepté" : "refusé"
        } votre demande d'assister au match "${invitation.event.title}" le ${new Date(
          invitation.event.eventDate,
        ).toLocaleDateString()}`,
        recruiterId: invitation.recruiterId, // ID du recruteur
      },
    });

    return NextResponse.json({ success: true, invitation: updatedInvitation });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'invitation" },
      { status: 500 },
    );
  }
}
