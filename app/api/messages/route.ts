// app/api/messages/route.ts
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, receiverId } = body;

    if (!content || !receiverId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const message = {
      id: Date.now().toString(),
      content,
      sender: session.user.id,
      receiver: receiverId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Sauvegarder le message dans la base de données
    await prisma.message.create({
      data: {
        content: message.content,
        senderId: message.sender,
        receiverId: message.receiver,
        isRead: false,
      },
    });

    // Si Pusher est configuré, envoyer la notification en temps réel
    if (pusherServer) {
      await pusherServer.trigger(
        `private-user-${receiverId}`,
        "new-message",
        message,
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
