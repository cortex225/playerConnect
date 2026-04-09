import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// GET - List groups (for current user's sport/region + joined groups)
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      select: { sportId: true, region: true, sport: { select: { name: true } } },
    });

    // Get groups the user is a member of
    const myGroups = await prisma.group.findMany({
      where: {
        members: { some: { userId: user.id } },
      },
      include: {
        _count: { select: { members: true, posts: true } },
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get suggested groups (same sport, same region, public)
    const suggested = await prisma.group.findMany({
      where: {
        isPublic: true,
        members: { none: { userId: user.id } },
        OR: [
          { sport: athlete?.sport?.name || undefined },
          { region: athlete?.region || undefined },
        ].filter((c) => Object.values(c).some(Boolean)),
      },
      include: {
        _count: { select: { members: true, posts: true } },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      myGroups: myGroups.map((g) => ({
        ...g,
        memberCount: g._count.members,
        postCount: g._count.posts,
        myRole: g.members[0]?.role || null,
      })),
      suggested: suggested.map((g) => ({
        ...g,
        memberCount: g._count.members,
        postCount: g._count.posts,
      })),
    });
  } catch (error) {
    console.error("[GROUPS_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// POST - Create a group
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { name, description, sport, region } = await req.json();
    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        sport: sport || null,
        region: region || null,
        createdBy: user.id,
        members: {
          create: { userId: user.id, role: "ADMIN" },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
