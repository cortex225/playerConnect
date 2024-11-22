import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: "Message ID requis" }, { status: 400 });
    }

    try {
        await prisma.message.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur API /messages/[id] :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}