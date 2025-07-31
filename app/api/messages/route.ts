// app/api/messages/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, receiverId } = body;

    if (!content || !receiverId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Créer le message dans la base de données
    const dbMessage = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        recipientId: receiverId,
        isRead: false,
      },
    });

    // Message pour Pusher avec plus d'informations
    const pusherMessage = {
      id: dbMessage.id,
      content: dbMessage.content,
      sender: session.user.id,
      recipient: receiverId,
      timestamp: dbMessage.createdAt,
      isRead: false,
    };

    // Si Pusher est configuré, envoyer la notification en temps réel
    if (pusherServer) {
      await pusherServer.trigger(
        `private-user-${receiverId}`,
        "new-message",
        pusherMessage,
      );
    }

    return NextResponse.json(pusherMessage);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
