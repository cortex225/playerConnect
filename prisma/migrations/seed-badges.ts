import { PrismaClient, BadgeType, BadgeRarity } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_BADGES: Array<{
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  condition: string;
  xpReward: number;
  rarity: BadgeRarity;
}> = [
  // Milestone Badges
  {
    name: "first_performance",
    description: "Ajoute ta première statistique de match",
    icon: "star",
    type: "MILESTONE",
    condition: "Ajouter au moins 1 performance",
    xpReward: 50,
    rarity: "COMMON",
  },
  {
    name: "10_performances",
    description: "Ajoute 10 statistiques de match",
    icon: "trophy",
    type: "MILESTONE",
    condition: "Ajouter au moins 10 performances",
    xpReward: 100,
    rarity: "COMMON",
  },
  {
    name: "50_performances",
    description: "Ajoute 50 statistiques de match",
    icon: "trophy",
    type: "MILESTONE",
    condition: "Ajouter au moins 50 performances",
    xpReward: 300,
    rarity: "RARE",
  },
  {
    name: "100_performances",
    description: "Ajoute 100 statistiques de match",
    icon: "trophy",
    type: "MILESTONE",
    condition: "Ajouter au moins 100 performances",
    xpReward: 500,
    rarity: "EPIC",
  },

  // Performance Badges
  {
    name: "top_performer",
    description: "Obtiens un score de performance supérieur à 90",
    icon: "award",
    type: "PERFORMANCE",
    condition: "Avoir au moins une performance avec un score >= 90",
    xpReward: 200,
    rarity: "EPIC",
  },
  {
    name: "perfect_score",
    description: "Obtiens un score de performance de 100",
    icon: "award",
    type: "PERFORMANCE",
    condition: "Avoir au moins une performance avec un score de 100",
    xpReward: 500,
    rarity: "LEGENDARY",
  },

  // Consistency Badges
  {
    name: "consistent_player",
    description: "Ajoute des stats 4 semaines consécutives",
    icon: "calendar",
    type: "CONSISTENCY",
    condition: "Avoir au moins 1 performance par semaine sur 4 semaines consécutives",
    xpReward: 150,
    rarity: "RARE",
  },
  {
    name: "dedicated_athlete",
    description: "Connexion quotidienne pendant 7 jours",
    icon: "flame",
    type: "CONSISTENCY",
    condition: "Se connecter 7 jours d'affilée",
    xpReward: 100,
    rarity: "COMMON",
  },
  {
    name: "monthly_champion",
    description: "Ajoute au moins 8 performances en un mois",
    icon: "calendar",
    type: "CONSISTENCY",
    condition: "Avoir au moins 8 performances dans un même mois",
    xpReward: 250,
    rarity: "RARE",
  },

  // Achievement Badges
  {
    name: "top_10_regional",
    description: "Atteins le top 10 du classement régional",
    icon: "zap",
    type: "ACHIEVEMENT",
    condition: "Être classé dans le top 10 régional",
    xpReward: 300,
    rarity: "EPIC",
  },
  {
    name: "top_10_national",
    description: "Atteins le top 10 du classement national",
    icon: "zap",
    type: "ACHIEVEMENT",
    condition: "Être classé dans le top 10 national",
    xpReward: 500,
    rarity: "LEGENDARY",
  },
  {
    name: "rising_star",
    description: "Gagne 10 places au classement en une semaine",
    icon: "trending-up",
    type: "ACHIEVEMENT",
    condition: "Progresser de 10 places ou plus au classement en une semaine",
    xpReward: 200,
    rarity: "RARE",
  },

  // Special Badges
  {
    name: "complete_profile",
    description: "Complète 100% de ton profil",
    icon: "user-check",
    type: "SPECIAL",
    condition: "Remplir tous les champs du profil",
    xpReward: 100,
    rarity: "COMMON",
  },
  {
    name: "media_master",
    description: "Ajoute 10 médias à ton profil",
    icon: "image",
    type: "SPECIAL",
    condition: "Avoir au moins 10 médias uploadés",
    xpReward: 150,
    rarity: "RARE",
  },
  {
    name: "early_adopter",
    description: "Fais partie des premiers utilisateurs de PlayerConnect",
    icon: "rocket",
    type: "SPECIAL",
    condition: "S'inscrire pendant la phase beta",
    xpReward: 300,
    rarity: "LEGENDARY",
  },
];

async function seedBadges() {
  console.log("🎖️  Initialisation des badges...");

  for (const badge of DEFAULT_BADGES) {
    try {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
      console.log(`✅ Badge créé/mis à jour: ${badge.name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création du badge ${badge.name}:`, error);
    }
  }

  console.log("✨ Initialisation des badges terminée!");
}

seedBadges()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
