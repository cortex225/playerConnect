import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { prisma } from "@/lib/db";

// Interface pour typer correctement les événements
interface EventWithAllFields {
  id: number;
  athleteId: number;
  title: string;
  location: string;
  eventDate: Date;
  isPublic: boolean;
  requiresParentalApproval: boolean;
  description?: string | null;
  color?: string | null;
  endDate?: Date | null;
}

// GET /api/events/[eventId] - Récupérer un événement spécifique
export async function GET(req: Request, props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const eventId = parseInt(params.eventId);

    if (isNaN(eventId)) {
      return new NextResponse("ID d'événement invalide", { status: 400 });
    }

    // Récupérer l'ID de l'athlète à partir de l'ID utilisateur
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!athlete) {
      return new NextResponse("Athlète non trouvé", { status: 404 });
    }

    // Récupérer l'événement
    const event = (await prisma.event.findFirst({
      where: {
        id: eventId,
        athleteId: athlete.id,
      },
    })) as EventWithAllFields | null;

    if (!event) {
      return new NextResponse("Événement non trouvé", { status: 404 });
    }

    // Formater l'événement pour FullCalendar
    const formattedEvent = {
      id: event.id.toString(),
      title: event.title,
      start: event.eventDate,
      end: event.endDate || undefined,
      location: event.location,
      description: event.description || "",
      isPublic: event.isPublic,
      color: event.color || "blue",
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("[EVENT_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// PUT /api/events/[eventId] - Mettre à jour un événement
export async function PUT(req: Request, props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const eventId = parseInt(params.eventId);

    if (isNaN(eventId)) {
      return new NextResponse("ID d'événement invalide", { status: 400 });
    }

    const body = await req.json();
    const { title, start, end, location, description, isPublic, color } = body;

    if (!title || !start) {
      return new NextResponse("Titre et date de début requis", { status: 400 });
    }

    // Récupérer l'ID de l'athlète à partir de l'ID utilisateur
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!athlete) {
      return new NextResponse("Athlète non trouvé", { status: 404 });
    }

    // Vérifier que l'événement appartient à l'athlète
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        athleteId: athlete.id,
      },
    });

    if (!existingEvent) {
      return new NextResponse("Événement non trouvé", { status: 404 });
    }

    // Mettre à jour l'événement
    const updatedEvent = (await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        location: location || "",
        eventDate: new Date(start),
        endDate: end ? new Date(end) : null,
        isPublic: isPublic || false,
        description: description || "",
        color: color || "blue",
      },
    })) as EventWithAllFields;

    // Formater l'événement pour FullCalendar
    const formattedEvent = {
      id: updatedEvent.id.toString(),
      title: updatedEvent.title,
      start: updatedEvent.eventDate,
      end: updatedEvent.endDate || undefined,
      location: updatedEvent.location,
      description: updatedEvent.description || "",
      isPublic: updatedEvent.isPublic,
      color: updatedEvent.color || "blue",
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("[EVENT_PUT]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// DELETE /api/events/[eventId] - Supprimer un événement
export async function DELETE(req: Request, props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const eventId = parseInt(params.eventId);

    if (isNaN(eventId)) {
      return new NextResponse("ID d'événement invalide", { status: 400 });
    }

    // Récupérer l'ID de l'athlète à partir de l'ID utilisateur
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!athlete) {
      return new NextResponse("Athlète non trouvé", { status: 404 });
    }

    // Vérifier que l'événement appartient à l'athlète
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        athleteId: athlete.id,
      },
    });

    if (!existingEvent) {
      return new NextResponse("Événement non trouvé", { status: 404 });
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[EVENT_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
