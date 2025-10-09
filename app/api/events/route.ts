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

// GET /api/events - Récupérer tous les événements de l'athlète connecté
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Récupérer l'ID de l'athlète à partir de l'ID utilisateur
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: session.id,
      },
    });

    if (!athlete) {
      console.log(`Athlète non trouvé pour l'utilisateur ${session.id}`);
      // Retourner un tableau vide au lieu d'une erreur 404
      return NextResponse.json([]);
    }

    // Récupérer tous les événements de l'athlète
    const events = (await prisma.event.findMany({
      where: {
        athleteId: athlete.id,
      },
    })) as EventWithAllFields[];

    // Formater les événements pour FullCalendar
    const formattedEvents = events.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      start: event.eventDate,
      end: event.endDate || undefined,
      location: event.location,
      description: event.description || "",
      isPublic: event.isPublic,
      color: event.color || "blue",
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    // Retourner un tableau vide au lieu d'une erreur 500
    return NextResponse.json([]);
  }
}

// POST /api/events - Créer un nouvel événement
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await req.json();
    const { title, start, end, location, description, isPublic, color } = body;

    if (!title || !start) {
      return new NextResponse("Titre et date de début requis", { status: 400 });
    }

    // Récupérer l'ID de l'athlète à partir de l'ID utilisateur
    const athlete = await prisma.athlete.findFirst({
      where: {
        userId: session.id,
      },
    });

    if (!athlete) {
      return new NextResponse("Athlète non trouvé", { status: 404 });
    }

    // Créer l'événement
    const event = (await prisma.event.create({
      data: {
        athleteId: athlete.id,
        title,
        location: location || "",
        eventDate: new Date(start),
        endDate: end ? new Date(end) : null,
        isPublic: isPublic || false,
        requiresParentalApproval: false,
        description: description || "",
        color: color || "blue",
      },
    })) as EventWithAllFields;

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
    console.error("[EVENTS_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
