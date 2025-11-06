// app/api/messages/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/db";
import {
  moderateContent,
  canCommunicate,
  logModerationAction,
  sanitizeContent,
} from "@/lib/moderation";

/**
 * GET - Récupérer les messages d'une conversation
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId");

    if (!recipientId) {
      return new NextResponse("Missing recipientId", { status: 400 });
    }

    // Vérifier si les utilisateurs peuvent communiquer
    const canChat = await canCommunicate(session.id, recipientId);
    if (!canChat.allowed) {
      return NextResponse.json(
        { error: canChat.reason },
        { status: 403 }
      );
    }

    // Récupérer les messages de la conversation
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.id, recipientId },
          { senderId: recipientId, recipientId: session.id },
        ],
        // Ne pas afficher les messages bloqués par la modération
        isFlagged: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Marquer les messages reçus comme lus
    await prisma.message.updateMany({
      where: {
        senderId: recipientId,
        recipientId: session.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * POST - Envoyer un nouveau message
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, recipientId } = body;

    if (!content || !recipientId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Vérifier si les utilisateurs peuvent communiquer
    const canChat = await canCommunicate(session.id, recipientId);
    if (!canChat.allowed) {
      return NextResponse.json(
        { error: canChat.reason },
        { status: 403 }
      );
    }

    // Modérer le contenu
    const moderationResult = await moderateContent(content);

    if (moderationResult.isBlocked) {
      // Enregistrer l'action de modération
      await logModerationAction({
        userId: session.id,
        action: "BLOCK",
        reason: moderationResult.reasons.join(", "),
        metadata: {
          blockedContent: content,
          patterns: moderationResult.flaggedPatterns,
        },
      });

      return NextResponse.json(
        {
          error:
            "Votre message contient du contenu interdit et ne peut pas être envoyé. Pour votre sécurité, veuillez ne pas partager d'informations personnelles.",
          blocked: true,
        },
        { status: 400 }
      );
    }

    // Nettoyer le contenu si nécessaire
    const sanitizedContent = sanitizeContent(content);

    // Créer le message dans la base de données
    const dbMessage = await prisma.message.create({
      data: {
        content: sanitizedContent,
        senderId: session.id,
        recipientId,
        isRead: false,
        isModerated: true,
        isFlagged: moderationResult.isSuspicious,
        flagReason: moderationResult.isSuspicious
          ? moderationResult.reasons.join(", ")
          : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Si le message est suspect, enregistrer l'action
    if (moderationResult.isSuspicious) {
      await logModerationAction({
        messageId: dbMessage.id,
        userId: session.id,
        action: "FLAG",
        reason: moderationResult.reasons.join(", "),
        metadata: {
          flaggedContent: content,
          patterns: moderationResult.flaggedPatterns,
        },
      });
    }

    // Message pour Pusher avec plus d'informations
    const pusherMessage = {
      id: dbMessage.id,
      content: dbMessage.content,
      senderId: session.id,
      sender: dbMessage.sender,
      recipientId,
      createdAt: dbMessage.createdAt,
      isRead: false,
    };

    // Si Pusher est configuré, envoyer la notification en temps réel
    if (pusherServer) {
      try {
        await pusherServer.trigger(
          `private-user-${recipientId}`,
          "new-message",
          pusherMessage,
        );

        // Envoyer aussi une notification
        await pusherServer.trigger(
          `private-user-${recipientId}`,
          "notification",
          {
            type: "new-message",
            from: dbMessage.sender.name,
            message: `Nouveau message de ${dbMessage.sender.name}`,
          },
        );
      } catch (pusherError) {
        console.error("[PUSHER_ERROR]", pusherError);
        // Continue même si Pusher échoue
      }
    }

    return NextResponse.json(pusherMessage);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
