// app/api/contacts/initiate/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { prisma } from "@/lib/db";
import { canCommunicate, isMinor } from "@/lib/moderation";

/**
 * POST - Initier une conversation avec un contact
 * Utilisé quand on clique "Contacter" sur un profil
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { contactId } = body;

    if (!contactId) {
      return new NextResponse("Missing contactId", { status: 400 });
    }

    // Vérifier que le contact existe
    const contact = await prisma.user.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        name: true,
        image: true,
        athletes: {
          select: {
            age: true,
            dateOfBirth: true,
          },
        },
        recruiters: {
          select: {
            organization: true,
          },
        },
      },
    });

    if (!contact) {
      return new NextResponse("Contact not found", { status: 404 });
    }

    // Vérifier si les utilisateurs peuvent communiquer
    const canChat = await canCommunicate(session.id, contactId);

    if (!canChat.allowed) {
      // Si c'est un mineur qui essaie de contacter quelqu'un
      const userIsMinor = await isMinor(session.id);

      if (userIsMinor) {
        // Créer automatiquement une demande d'approbation
        await prisma.approvedContact.upsert({
          where: {
            userId_contactId: {
              userId: session.id,
              contactId,
            },
          },
          update: {
            isActive: false, // En attente d'approbation
          },
          create: {
            userId: session.id,
            contactId,
            isActive: false, // En attente d'approbation
          },
        });

        return NextResponse.json(
          {
            needsApproval: true,
            message: "Une demande d'approbation a été envoyée à votre parent/tuteur. Vous pourrez contacter cette personne une fois approuvé.",
            contact,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: canChat.reason },
        { status: 403 }
      );
    }

    // Vérifier si une conversation existe déjà
    const existingMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: session.id, recipientId: contactId },
          { senderId: contactId, recipientId: session.id },
        ],
      },
    });

    // Retourner les infos du contact pour ouvrir la conversation
    return NextResponse.json({
      success: true,
      contact,
      hasExistingConversation: !!existingMessage,
      message: existingMessage
        ? "Conversation existante ouverte"
        : "Nouvelle conversation initiée",
    });
  } catch (error) {
    console.error("[CONTACTS_INITIATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
