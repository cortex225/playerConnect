import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// GET - Get activity feed for current user
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get("unread") === "true";

    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        actor: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // Mark as read
    if (activities.length > 0) {
      await prisma.activity.updateMany({
        where: {
          userId: user.id,
          isRead: false,
          id: { in: activities.map((a) => a.id) },
        },
        data: { isRead: true },
      });
    }

    const unreadCount = await prisma.activity.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({ activities, unreadCount });
  } catch (error) {
    console.error("[ACTIVITY_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
