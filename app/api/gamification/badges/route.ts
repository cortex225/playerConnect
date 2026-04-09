import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Define badge conditions that are checked against real data
const BADGE_DEFINITIONS = [
  // MILESTONE badges
  {
    name: "Premier pas",
    description: "Ajoute ta premiere performance",
    icon: "star",
    type: "MILESTONE",
    rarity: "COMMON",
    xpReward: 50,
    check: (data: AthleteData) => data.performanceCount >= 1,
    progress: (data: AthleteData) => Math.min((data.performanceCount / 1) * 100, 100),
  },
  {
    name: "En route",
    description: "Ajoute 5 performances",
    icon: "trending-up",
    type: "MILESTONE",
    rarity: "COMMON",
    xpReward: 100,
    check: (data: AthleteData) => data.performanceCount >= 5,
    progress: (data: AthleteData) => Math.min((data.performanceCount / 5) * 100, 100),
  },
  {
    name: "Regulier",
    description: "Ajoute 10 performances",
    icon: "zap",
    type: "MILESTONE",
    rarity: "RARE",
    xpReward: 200,
    check: (data: AthleteData) => data.performanceCount >= 10,
    progress: (data: AthleteData) => Math.min((data.performanceCount / 10) * 100, 100),
  },
  {
    name: "Machine",
    description: "Ajoute 25 performances",
    icon: "flame",
    type: "MILESTONE",
    rarity: "EPIC",
    xpReward: 500,
    check: (data: AthleteData) => data.performanceCount >= 25,
    progress: (data: AthleteData) => Math.min((data.performanceCount / 25) * 100, 100),
  },
  // PERFORMANCE badges
  {
    name: "Prometteur",
    description: "Obtiens un score superieur a 50",
    icon: "trophy",
    type: "PERFORMANCE",
    rarity: "COMMON",
    xpReward: 75,
    check: (data: AthleteData) => data.bestScore >= 50,
    progress: (data: AthleteData) => Math.min((data.bestScore / 50) * 100, 100),
  },
  {
    name: "Performeur",
    description: "Obtiens un score superieur a 75",
    icon: "trophy",
    type: "PERFORMANCE",
    rarity: "RARE",
    xpReward: 150,
    check: (data: AthleteData) => data.bestScore >= 75,
    progress: (data: AthleteData) => Math.min((data.bestScore / 75) * 100, 100),
  },
  {
    name: "Elite",
    description: "Obtiens un score superieur a 90",
    icon: "award",
    type: "PERFORMANCE",
    rarity: "EPIC",
    xpReward: 300,
    check: (data: AthleteData) => data.bestScore >= 90,
    progress: (data: AthleteData) => Math.min((data.bestScore / 90) * 100, 100),
  },
  {
    name: "Legende",
    description: "Obtiens un score parfait de 100",
    icon: "crown",
    type: "PERFORMANCE",
    rarity: "LEGENDARY",
    xpReward: 1000,
    check: (data: AthleteData) => data.bestScore >= 100,
    progress: (data: AthleteData) => Math.min((data.bestScore / 100) * 100, 100),
  },
  // MEDIA badges
  {
    name: "Cameraman",
    description: "Upload ta premiere video",
    icon: "video",
    type: "MILESTONE",
    rarity: "COMMON",
    xpReward: 25,
    check: (data: AthleteData) => data.mediaCount >= 1,
    progress: (data: AthleteData) => Math.min((data.mediaCount / 1) * 100, 100),
  },
  {
    name: "Createur",
    description: "Upload 5 medias",
    icon: "video",
    type: "MILESTONE",
    rarity: "RARE",
    xpReward: 100,
    check: (data: AthleteData) => data.mediaCount >= 5,
    progress: (data: AthleteData) => Math.min((data.mediaCount / 5) * 100, 100),
  },
  {
    name: "Star des reseaux",
    description: "Upload 15 medias",
    icon: "sparkles",
    type: "MILESTONE",
    rarity: "EPIC",
    xpReward: 250,
    check: (data: AthleteData) => data.mediaCount >= 15,
    progress: (data: AthleteData) => Math.min((data.mediaCount / 15) * 100, 100),
  },
  // EVENT badges
  {
    name: "Organisateur",
    description: "Cree ton premier match public",
    icon: "calendar",
    type: "ACHIEVEMENT",
    rarity: "COMMON",
    xpReward: 50,
    check: (data: AthleteData) => data.publicEventCount >= 1,
    progress: (data: AthleteData) => Math.min((data.publicEventCount / 1) * 100, 100),
  },
  {
    name: "Visible",
    description: "Recois ta premiere demande de recruteur",
    icon: "eye",
    type: "ACHIEVEMENT",
    rarity: "RARE",
    xpReward: 150,
    check: (data: AthleteData) => data.invitationCount >= 1,
    progress: (data: AthleteData) => Math.min((data.invitationCount / 1) * 100, 100),
  },
  {
    name: "Convoite",
    description: "Recois 5 demandes de recruteurs",
    icon: "users",
    type: "ACHIEVEMENT",
    rarity: "EPIC",
    xpReward: 300,
    check: (data: AthleteData) => data.invitationCount >= 5,
    progress: (data: AthleteData) => Math.min((data.invitationCount / 5) * 100, 100),
  },
  {
    name: "Phenix",
    description: "Recois 10 demandes de recruteurs",
    icon: "flame",
    type: "ACHIEVEMENT",
    rarity: "LEGENDARY",
    xpReward: 500,
    check: (data: AthleteData) => data.invitationCount >= 10,
    progress: (data: AthleteData) => Math.min((data.invitationCount / 10) * 100, 100),
  },
  // LEVEL badges
  {
    name: "Niveau 5",
    description: "Atteins le niveau 5",
    icon: "zap",
    type: "MILESTONE",
    rarity: "RARE",
    xpReward: 200,
    check: (data: AthleteData) => data.level >= 5,
    progress: (data: AthleteData) => Math.min((data.level / 5) * 100, 100),
  },
  {
    name: "Niveau 10",
    description: "Atteins le niveau 10",
    icon: "crown",
    type: "MILESTONE",
    rarity: "LEGENDARY",
    xpReward: 1000,
    check: (data: AthleteData) => data.level >= 10,
    progress: (data: AthleteData) => Math.min((data.level / 10) * 100, 100),
  },
];

interface AthleteData {
  performanceCount: number;
  bestScore: number;
  mediaCount: number;
  publicEventCount: number;
  invitationCount: number;
  level: number;
  streak: number;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      include: {
        performances: { select: { score: true } },
        media: { select: { id: true } },
        events: {
          select: { isPublic: true, invitations: { select: { id: true } } },
        },
      },
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete non trouve" }, { status: 404 });
    }

    // Calculate real data
    const data: AthleteData = {
      performanceCount: athlete.performances.length,
      bestScore: athlete.performances.length > 0
        ? Math.max(...athlete.performances.map((p) => p.score))
        : 0,
      mediaCount: athlete.media.length,
      publicEventCount: athlete.events.filter((e) => e.isPublic).length,
      invitationCount: athlete.events.reduce((sum, e) => sum + e.invitations.length, 0),
      level: athlete.level,
      streak: 0, // TODO: implement streak tracking
    };

    // Calculate badges
    const badges = BADGE_DEFINITIONS.map((def, index) => ({
      id: `badge-${index}`,
      name: def.name,
      description: def.description,
      icon: def.icon,
      type: def.type,
      rarity: def.rarity,
      xpReward: def.xpReward,
      earned: def.check(data),
      progress: Math.round(def.progress(data)),
    }));

    // Summary stats
    const earnedCount = badges.filter((b) => b.earned).length;
    const totalXpFromBadges = badges
      .filter((b) => b.earned)
      .reduce((sum, b) => sum + b.xpReward, 0);

    return NextResponse.json({
      badges,
      stats: {
        earned: earnedCount,
        total: badges.length,
        totalXp: totalXpFromBadges,
        ...data,
      },
    });
  } catch (error) {
    console.error("[BADGES_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
