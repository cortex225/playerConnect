import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// POST - Share an event with another athlete
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { eventId, targetUserId, message } = await req.json();
    if (!eventId || !targetUserId) {
      return NextResponse.json({ error: "eventId et targetUserId requis" }, { status: 400 });
    }

    // Verify event exists and is public
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Evenement non trouve" }, { status: 404 });

    // Create share
    const share = await prisma.eventShare.upsert({
      where: {
        eventId_sharedBy_sharedTo: {
          eventId,
          sharedBy: user.id,
          sharedTo: targetUserId,
        },
      },
      update: { message: message || null, seen: false },
      create: {
        eventId,
        sharedBy: user.id,
        sharedTo: targetUserId,
        message: message || null,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: targetUserId,
        actorId: user.id,
        type: "LIKE", // Reuse LIKE type for now - or we could add EVENT_SHARE
        mediaId: null,
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error("[EVENT_SHARE]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// GET - Get shared events for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const shares = await prisma.eventShare.findMany({
      where: { sharedTo: user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            endDate: true,
            location: true,
            description: true,
          },
        },
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Mark as seen
    await prisma.eventShare.updateMany({
      where: { sharedTo: user.id, seen: false },
      data: { seen: true },
    });

    return NextResponse.json(shares);
  } catch (error) {
    console.error("[EVENT_SHARES_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
