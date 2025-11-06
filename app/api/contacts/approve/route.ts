// app/api/contacts/approve/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { prisma } from "@/lib/db";

/**
 * POST - Approuver un contact (pour parents/tuteurs ou administrateurs)
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Missing approval token", { status: 400 });
    }

    const body = await req.json();
    const { userId, contactId, approved } = body;

    if (!userId || !contactId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (approved) {
      // Approuver le contact
      const approvedContact = await prisma.approvedContact.upsert({
        where: {
          userId_contactId: {
            userId,
            contactId,
          },
        },
        update: {
          isActive: true,
          approvedBy: "parent", // Dans un système complet, on utiliserait l'ID du parent
          approvedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        },
        create: {
          userId,
          contactId,
          isActive: true,
          approvedBy: "parent",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        },
      });

      return NextResponse.json({
        message: "Contact approuvé avec succès",
        contact: approvedContact,
      });
    } else {
      // Refuser le contact
      await prisma.approvedContact.delete({
        where: {
          userId_contactId: {
            userId,
            contactId,
          },
        },
      });

      return NextResponse.json({
        message: "Contact refusé",
      });
    }
  } catch (error) {
    console.error("[CONTACTS_APPROVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
