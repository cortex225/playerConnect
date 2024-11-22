// app/api/connected-users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: { isOnline: true },
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Erreur API /connected-users :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}