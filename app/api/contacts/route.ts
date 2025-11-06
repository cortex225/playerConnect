// app/api/contacts/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { prisma } from "@/lib/db";
import { isMinor } from "@/lib/moderation";

/**
 * GET - Obtenir la liste des conversations actives
 * Retourne seulement les personnes avec qui on a déjà échangé des messages
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Récupérer tous les messages où l'utilisateur est impliqué
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.id },
          { recipientId: session.id },
        ],
      },
      select: {
        senderId: true,
        recipientId: true,
        createdAt: true,
        isRead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extraire les IDs uniques des contacts
    const contactIds = new Set<string>();
    const lastMessageMap = new Map<string, { date: Date; unreadCount: number }>();

    messages.forEach((msg) => {
      const contactId = msg.senderId === session.id ? msg.recipientId : msg.senderId;
      contactIds.add(contactId);

      // Garder le dernier message pour chaque contact
      if (!lastMessageMap.has(contactId)) {
        const unreadCount = messages.filter(
          m => m.senderId === contactId && m.recipientId === session.id && !m.isRead
        ).length;

        lastMessageMap.set(contactId, {
          date: msg.createdAt,
          unreadCount,
        });
      }
    });

    // Si aucun contact, retourner un tableau vide
    if (contactIds.size === 0) {
      return NextResponse.json([]);
    }

    // Récupérer les détails de tous les contacts
    const contacts = await prisma.user.findMany({
      where: {
        id: { in: Array.from(contactIds) },
      },
      select: {
        id: true,
        name: true,
        image: true,
        athletes: {
          select: {
            age: true,
            city: true,
            country: true,
            sport: {
              select: {
                name: true,
              },
            },
          },
        },
        recruiters: {
          select: {
            organization: true,
            position: true,
          },
        },
      },
    });

    // Vérifier si l'utilisateur est mineur pour les contacts approuvés
    const userIsMinor = await isMinor(session.id);
    let approvedContactIds = new Set<string>();

    if (userIsMinor) {
      const approvedContacts = await prisma.approvedContact.findMany({
        where: {
          userId: session.id,
          isActive: true,
        },
        select: {
          contactId: true,
        },
      });
      approvedContactIds = new Set(approvedContacts.map(ac => ac.contactId));
    }

    // Enrichir les contacts avec les infos de dernière conversation
    const enrichedContacts = contacts
      .map((contact) => {
        const lastMsg = lastMessageMap.get(contact.id);
        return {
          ...contact,
          lastMessageDate: lastMsg?.date,
          unreadCount: lastMsg?.unreadCount || 0,
          approved: userIsMinor ? approvedContactIds.has(contact.id) : true,
        };
      })
      .sort((a, b) => {
        // Trier par date du dernier message (plus récent en premier)
        return (b.lastMessageDate?.getTime() || 0) - (a.lastMessageDate?.getTime() || 0);
      });

    return NextResponse.json(enrichedContacts);
  } catch (error) {
    console.error("[CONTACTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * POST - Demander l'approbation d'un contact (pour mineurs)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { contactId, parentEmail } = body;

    if (!contactId) {
      return new NextResponse("Missing contactId", { status: 400 });
    }

    // Vérifier si l'utilisateur est un mineur
    const userIsMinor = await isMinor(session.id);

    if (!userIsMinor) {
      return NextResponse.json(
        { error: "Seuls les mineurs nécessitent une approbation de contact" },
        { status: 400 }
      );
    }

    // Vérifier si le contact existe
    const contact = await prisma.user.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return new NextResponse("Contact not found", { status: 404 });
    }

    // Créer ou mettre à jour l'approbation de contact (en attente)
    const approvedContact = await prisma.approvedContact.upsert({
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

    // TODO: Envoyer un email au parent pour approbation
    // Cela nécessite l'intégration avec Resend

    return NextResponse.json({
      message: "Demande d'approbation envoyée au parent/tuteur",
      contact: approvedContact,
    });
  } catch (error) {
    console.error("[CONTACTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
