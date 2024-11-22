import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: "User ID requis" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                isOnline: true,
                isTyping: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Erreur API /user-status/[id] :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}