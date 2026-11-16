// Données de démonstration pour PlayerConnect.
// Athlètes, équipes et recruteurs fictifs. Déterministe : mêmes données à chaque exécution.
// Refuse de tourner ailleurs que sur une base locale.
//
//   DATABASE_URL=postgresql://postgres@localhost:5432/playerconnect_demo pnpm db:demo
//
// Comptes créés (mot de passe commun : DEMO_PASSWORD ci-dessous) :
//   athlete@demo.playerconnect.local   (Maëlle Tremblay, basketball)
//   recruteur@demo.playerconnect.local (Karim Benali, recruteur basketball)

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const DEMO_PASSWORD = "demo-playerconnect";
const DEMO_DOMAIN = "demo.playerconnect.local";

// Double garde : hôte local ET nom de base se terminant par _demo.
// Un tunnel vers une base distante passerait le premier test, pas le second.
let target;
try {
  target = new URL(process.env.DATABASE_URL ?? "");
} catch {
  target = null;
}
const dbName = target?.pathname.replace(/^\//, "") ?? "";
if (
  !target ||
  !["localhost", "127.0.0.1"].includes(target.hostname) ||
  !dbName.endsWith("_demo")
) {
  console.error(
    "Refus : demo-seed ne tourne que sur une base locale dont le nom se termine par _demo (ex. postgresql://postgres@localhost:5432/playerconnect_demo).",
  );
  process.exit(1);
}

const prisma = new PrismaClient();

// Générateur pseudo-aléatoire déterministe (mulberry32).
let seed = 20261116;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (min, max) => min + rand() * (max - min);
const round1 = (n) => Math.round(n * 10) / 10;
const pick = (list) => list[Math.floor(rand() * list.length)];

const NOW = new Date("2026-11-16T12:00:00-05:00");
const daysFromNow = (d, hour = 19) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() + d);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const avatar = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=400&q=80`;

const PHOTOS = {
  BASKETBALL: [
    { id: "1519766304817-4f37bda74a26", title: "Lancer franc en fin de match" },
    { id: "1580692475446-c2fabbbbf835", title: "Pénétration contre la zone" },
    { id: "1505666287802-931dc83948e9", title: "Transition rapide, 3e quart" },
    {
      id: "1563506644863-444710df1e03",
      title: "Échauffement avant le tournoi",
    },
    { id: "1612151387840-62fb3b521841", title: "Séance de tirs du matin" },
  ],
  SOCCER: [
    { id: "1574629810360-7efbbe195018", title: "Coup franc à l'entraînement" },
    { id: "1560272564-c83b66b1ad12", title: "Frappe hors de la surface" },
    {
      id: "1579952363873-27f3bade9f55",
      title: "Contrôle orienté sous pression",
    },
    { id: "1606925797300-0b35e9d1794e", title: "Duel au milieu de terrain" },
  ],
  FOOTBALL: [
    { id: "1566577739112-5180d4bf9390", title: "Retour de botté, 2e demie" },
    { id: "1508863702330-2eece3ea08cb", title: "Match en soirée au stade" },
  ],
  RUGBY: [
    { id: "1480099225005-2513c8947aec", title: "Mêlée ordonnée en finale" },
    { id: "1558151507-c1aa3d917dbb", title: "Prise de balle après touche" },
    { id: "1529663297269-6d349ec39b57", title: "Avant-match au stade" },
  ],
};

const KPIS = {
  BASKETBALL: [
    { name: "Points", min: 6, max: 26, weight: 0.35 },
    { name: "Passes décisives", min: 1, max: 9, weight: 0.2 },
    { name: "Rebonds", min: 2, max: 11, weight: 0.2 },
    { name: "Interceptions", min: 0, max: 4, weight: 0.15 },
    { name: "Tirs à 3 pts réussis", min: 0, max: 5, weight: 0.1 },
  ],
  SOCCER: [
    { name: "Buts", min: 0, max: 2, weight: 0.3 },
    { name: "Passes décisives", min: 0, max: 2, weight: 0.2 },
    { name: "Passes réussies (%)", min: 68, max: 91, weight: 0.2 },
    { name: "Duels gagnés", min: 3, max: 12, weight: 0.15 },
    { name: "Tirs cadrés", min: 0, max: 5, weight: 0.15 },
  ],
  FOOTBALL: [
    { name: "Verges gagnées", min: 20, max: 160, weight: 0.35 },
    { name: "Touchés", min: 0, max: 2, weight: 0.25 },
    { name: "Réceptions", min: 1, max: 8, weight: 0.15 },
    { name: "Plaqués", min: 0, max: 9, weight: 0.15 },
    { name: "Interceptions", min: 0, max: 1, weight: 0.1 },
  ],
  RUGBY: [
    { name: "Essais", min: 0, max: 2, weight: 0.3 },
    { name: "Plaquages réussis", min: 4, max: 16, weight: 0.25 },
    { name: "Mètres parcourus", min: 15, max: 90, weight: 0.2 },
    { name: "Ballons gagnés", min: 0, max: 4, weight: 0.15 },
    { name: "Passes", min: 5, max: 22, weight: 0.1 },
  ],
};

const POSITIONS = {
  BASKETBALL: [
    "POINT_GUARD",
    "SHOOTING_GUARD",
    "SMALL_FORWARD",
    "POWER_FORWARD",
    "CENTER",
  ],
  SOCCER: ["FORWARD", "MIDFIELDER", "DEFENDER", "GOALKEEPER"],
  FOOTBALL: [
    "QUARTERBACK",
    "RUNNING_BACK",
    "WIDE_RECEIVER",
    "LINEBACKER",
    "CORNERBACK",
    "SAFETY",
  ],
  RUGBY: ["PROP", "HOOKER", "LOCK", "FLANKER", "NUMBER_EIGHT"],
};

const LEVELS = ["Scolaire", "Collégial", "Universitaire"];

const CITIES = [
  { city: "Québec", region: "Capitale-Nationale" },
  { city: "Lévis", region: "Chaudière-Appalaches" },
  { city: "Montréal", region: "Montréal" },
  { city: "Laval", region: "Laval" },
  { city: "Sherbrooke", region: "Estrie" },
  { city: "Trois-Rivières", region: "Mauricie" },
  { city: "Gatineau", region: "Outaouais" },
  { city: "Saguenay", region: "Saguenay–Lac-Saint-Jean" },
  { city: "Longueuil", region: "Montérégie" },
  { city: "Rimouski", region: "Bas-Saint-Laurent" },
];

// [prénom nom, genre, sport, position, niveau, catégorie, année de naissance, photo de profil?]
const ATHLETES = [
  [
    "Maëlle Tremblay",
    "FEMININ",
    "BASKETBALL",
    "POINT_GUARD",
    "Collégial",
    "SENIOR",
    2007,
  ],
  [
    "Jérémie Ouellet",
    "MASCULIN",
    "BASKETBALL",
    "SHOOTING_GUARD",
    "Collégial",
    "SENIOR",
    2006,
  ],
  [
    "Awa Diallo",
    "FEMININ",
    "BASKETBALL",
    "POWER_FORWARD",
    "Universitaire",
    "SENIOR",
    2004,
  ],
  [
    "Samuel Gagnon-Roy",
    "MASCULIN",
    "BASKETBALL",
    "CENTER",
    "Collégial",
    "SENIOR",
    2006,
  ],
  [
    "Léa Bouchard",
    "FEMININ",
    "BASKETBALL",
    "SMALL_FORWARD",
    "Scolaire",
    "JUVENILE",
    2009,
  ],
  [
    "Nathan Côté",
    "MASCULIN",
    "BASKETBALL",
    "POINT_GUARD",
    "Scolaire",
    "JUVENILE",
    2009,
  ],
  [
    "Inès Haddad",
    "FEMININ",
    "BASKETBALL",
    "SHOOTING_GUARD",
    "Universitaire",
    "SENIOR",
    2003,
  ],
  [
    "Olivier Pelletier",
    "MASCULIN",
    "BASKETBALL",
    "SMALL_FORWARD",
    "Universitaire",
    "SENIOR",
    2004,
  ],
  [
    "Camille Lavoie",
    "FEMININ",
    "SOCCER",
    "MIDFIELDER",
    "Collégial",
    "SENIOR",
    2006,
  ],
  [
    "Yanis Mercier",
    "MASCULIN",
    "SOCCER",
    "FORWARD",
    "Collégial",
    "SENIOR",
    2007,
  ],
  [
    "Rosalie Gauthier",
    "FEMININ",
    "SOCCER",
    "DEFENDER",
    "Universitaire",
    "SENIOR",
    2004,
  ],
  [
    "Mamadou Sow",
    "MASCULIN",
    "SOCCER",
    "MIDFIELDER",
    "Scolaire",
    "JUVENILE",
    2009,
  ],
  [
    "Florence Morin",
    "FEMININ",
    "SOCCER",
    "GOALKEEPER",
    "Collégial",
    "SENIOR",
    2007,
  ],
  [
    "Thomas Leblanc",
    "MASCULIN",
    "SOCCER",
    "DEFENDER",
    "Scolaire",
    "CADET",
    2010,
  ],
  [
    "Alexis Fortin",
    "MASCULIN",
    "FOOTBALL",
    "QUARTERBACK",
    "Collégial",
    "SENIOR",
    2006,
  ],
  [
    "Junior Pierre-Louis",
    "MASCULIN",
    "FOOTBALL",
    "RUNNING_BACK",
    "Universitaire",
    "SENIOR",
    2004,
  ],
  [
    "William Bergeron",
    "MASCULIN",
    "FOOTBALL",
    "WIDE_RECEIVER",
    "Collégial",
    "SENIOR",
    2007,
  ],
  [
    "Zachary Dubé",
    "MASCULIN",
    "FOOTBALL",
    "LINEBACKER",
    "Scolaire",
    "JUVENILE",
    2009,
  ],
  [
    "Louis-Félix Girard",
    "MASCULIN",
    "FOOTBALL",
    "CORNERBACK",
    "Universitaire",
    "SENIOR",
    2003,
  ],
  [
    "Émile Caron",
    "MASCULIN",
    "RUGBY",
    "FLANKER",
    "Universitaire",
    "SENIOR",
    2004,
  ],
  [
    "Charlotte Nadeau",
    "FEMININ",
    "RUGBY",
    "NUMBER_EIGHT",
    "Universitaire",
    "SENIOR",
    2005,
  ],
  ["Adam Belhadj", "MASCULIN", "RUGBY", "PROP", "Collégial", "SENIOR", 2006],
  [
    "Marianne Poirier",
    "FEMININ",
    "RUGBY",
    "HOOKER",
    "Collégial",
    "SENIOR",
    2007,
  ],
  ["Félix Lachance", "MASCULIN", "RUGBY", "LOCK", "Scolaire", "JUVENILE", 2009],
];

const RECRUITERS = [
  [
    "Karim Benali",
    "Programme de basketball, Université du Littoral",
    "Entraîneur adjoint, recrutement",
    "Capitale-Nationale",
    9,
  ],
  [
    "Sophie Lemieux",
    "Cégep des Deux-Rives, Riverains",
    "Entraîneuse-chef, soccer féminin",
    "Chaudière-Appalaches",
    12,
  ],
  [
    "Marc-André Simard",
    "Académie de football du Nord",
    "Coordonnateur défensif",
    "Saguenay–Lac-Saint-Jean",
    15,
  ],
  [
    "Nadia Boucher",
    "Club de rugby Saint-Laurent",
    "Directrice technique",
    "Montréal",
    7,
  ],
  [
    "David Chen",
    "Université des Monts, basketball masculin",
    "Recruteur",
    "Estrie",
    5,
  ],
];

const BADGES = [
  {
    name: "first_performance",
    description: "Première note de match ajoutée",
    icon: "star",
    type: "MILESTONE",
    condition: "1 performance",
    xpReward: 50,
    rarity: "COMMON",
  },
  {
    name: "10_performances",
    description: "10 matchs documentés",
    icon: "trophy",
    type: "MILESTONE",
    condition: "10 performances",
    xpReward: 100,
    rarity: "COMMON",
  },
  {
    name: "consistent_player",
    description: "Note de 70+ sur 5 matchs de suite",
    icon: "flame",
    type: "CONSISTENCY",
    condition: "5 matchs à 70+",
    xpReward: 150,
    rarity: "RARE",
  },
  {
    name: "top_10",
    description: "Top 10 de son sport",
    icon: "medal",
    type: "ACHIEVEMENT",
    condition: "Rang 10 ou mieux",
    xpReward: 250,
    rarity: "EPIC",
  },
];

async function resetDemoData() {
  // Supprime uniquement les comptes du domaine de démo (cascade sur leurs données).
  await prisma.notification.deleteMany({
    where: { userRef: { email: { endsWith: `@${DEMO_DOMAIN}` } } },
  });
  await prisma.user.deleteMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
  });
}

async function ensureReferenceData() {
  const sports = {};
  for (const name of Object.keys(POSITIONS)) {
    const sport = await prisma.sport.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    sports[name] = { ...sport, positions: {}, categories: {} };
    for (const position of POSITIONS[name]) {
      const row = await prisma.position.upsert({
        where: { name_sportId: { name: position, sportId: sport.id } },
        update: {},
        create: { name: position, sportId: sport.id },
      });
      sports[name].positions[position] = row;
    }
    for (const levelName of LEVELS) {
      const level = await prisma.level.upsert({
        where: { name_sportId: { name: levelName, sportId: sport.id } },
        update: {},
        create: { name: levelName, sportId: sport.id },
      });
      for (const category of ["BENJAMIN", "CADET", "JUVENILE", "SENIOR"]) {
        const row = await prisma.category.upsert({
          where: { name_levelId: { name: category, levelId: level.id } },
          update: {},
          create: { name: category, levelId: level.id },
        });
        sports[name].categories[`${levelName}:${category}`] = row;
      }
    }
  }
  const badges = {};
  for (const badge of BADGES) {
    badges[badge.name] = await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
  return { sports, badges };
}

function slug(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

async function createUser({ name, email, role, image, withPassword }) {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      image,
      emailVerified: true,
      lastActivity: daysFromNow(-1, 10),
    },
  });
  if (withPassword) {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        type: "credential",
        password: await hashPassword(DEMO_PASSWORD),
      },
    });
  }
  return user;
}

async function main() {
  await resetDemoData();
  const { sports, badges } = await ensureReferenceData();

  // ---------- Athlètes ----------
  const athletes = [];
  for (const [index, row] of ATHLETES.entries()) {
    const [
      name,
      gender,
      sportName,
      positionName,
      levelName,
      category,
      birthYear,
    ] = row;
    const isDemo = index === 0;
    const sport = sports[sportName];
    const place = isDemo ? CITIES[0] : CITIES[index % CITIES.length];
    const user = await createUser({
      name,
      email: isDemo ? `athlete@${DEMO_DOMAIN}` : `${slug(name)}@${DEMO_DOMAIN}`,
      role: "ATHLETE",
      image: isDemo
        ? avatar("1607286908165-b8b6a2874fc4")
        : null,
      withPassword: isDemo,
    });
    const birth = new Date(
      `${birthYear}-0${1 + (index % 9)}-1${index % 9}T12:00:00Z`,
    );
    const age = 2026 - birthYear - (birth.getMonth() > 10 ? 1 : 0);
    const minor = age < 18;

    const athlete = await prisma.athlete.create({
      data: {
        userId: user.id,
        gender,
        age,
        dateOfBirth: birth,
        city: place.city,
        region: place.region,
        country: "Canada",
        height: Math.round(
          gender === "FEMININ" ? between(160, 182) : between(172, 198),
        ),
        weight: Math.round(
          gender === "FEMININ" ? between(55, 75) : between(68, 102),
        ),
        dominantHand: rand() > 0.15 ? "DROITE" : "GAUCHE",
        dominantFoot: rand() > 0.2 ? "DROITE" : "GAUCHE",
        programType: levelName === "Scolaire" ? "SCOLAIRE" : "SCOLAIRE_CIVILE",
        categoryId: sport.categories[`${levelName}:${category}`].id,
        sportId: sport.id,
        parentalConsentRequired: minor,
        parentalConsentGiven: minor,
        parentEmail: minor ? `parent.${slug(name)}@${DEMO_DOMAIN}` : null,
        positions: {
          create: [{ positionId: sport.positions[positionName].id }],
        },
      },
    });
    athletes.push({ ...athlete, user, sportName, positionName, isDemo });
  }

  // ---------- Performances et KPI ----------
  for (const athlete of athletes) {
    const base = athlete.isDemo ? 74 : between(55, 82);
    const trend = athlete.isDemo ? 1.4 : between(-0.6, 1.6);
    const games = athlete.isDemo ? 10 : 6 + Math.floor(rand() * 5);
    const kpis = KPIS[athlete.sportName];
    const position = await prisma.position.findFirst({
      where: { name: athlete.positionName, sportId: athlete.sportId },
    });
    let total = 0;
    for (let g = 0; g < games; g++) {
      const score = Math.min(
        97,
        Math.max(40, base + trend * g + between(-7, 7)),
      );
      total += score;
      await prisma.performance.create({
        data: {
          athleteId: athlete.id,
          positionId: position.id,
          date: daysFromNow(-7 * (games - g), 19),
          score: round1(score),
          KPI: {
            create: kpis.map((kpi) => ({
              name: kpi.name,
              weight: kpi.weight,
              positionId: position.id,
              value: round1(
                kpi.min +
                  ((kpi.max - kpi.min) * (score - 40)) / 57 +
                  between(-1, 1) * (kpi.max - kpi.min) * 0.12,
              ),
            })),
          },
        },
      });
    }
    const xp = games * 50 + 100 + Math.floor(between(0, 600));
    const level = [0, 100, 300, 600, 1000, 1500, 2200, 3000].filter(
      (t) => xp >= t,
    ).length;
    await prisma.athlete.update({
      where: { id: athlete.id },
      data: { totalScore: round1(total), xp, level },
    });
    athlete.totalScore = total;
    athlete.games = games;
  }

  // ---------- Classement et badges ----------
  for (const sportName of Object.keys(POSITIONS)) {
    const ranked = athletes
      .filter((a) => a.sportName === sportName)
      .sort((a, b) => b.totalScore - a.totalScore);
    for (const [i, athlete] of ranked.entries()) {
      await prisma.ranking.create({
        data: {
          athleteId: athlete.id,
          sportId: athlete.sportId,
          scope: "GLOBAL",
          rank: i + 1,
          score: round1(athlete.totalScore),
          period: "all-time",
          country: "Canada",
        },
      });
      const earned = ["first_performance"];
      if (athlete.games >= 10) earned.push("10_performances");
      if (i < 3) earned.push("consistent_player");
      if (i < 10) earned.push("top_10");
      for (const [k, badgeName] of earned.entries()) {
        await prisma.athleteBadge.create({
          data: {
            athleteId: athlete.id,
            badgeId: badges[badgeName].id,
            earnedAt: daysFromNow(-40 + k * 9, 20),
          },
        });
      }
    }
  }

  // ---------- Recruteurs ----------
  const recruiters = [];
  for (const [
    index,
    [name, organization, position, region, experience],
  ] of RECRUITERS.entries()) {
    const isDemo = index === 0;
    const user = await createUser({
      name,
      email: isDemo
        ? `recruteur@${DEMO_DOMAIN}`
        : `${slug(name)}@${DEMO_DOMAIN}`,
      role: "RECRUITER",
      image: isDemo
        ? avatar("1516224498413-84ecf3a1e7fd")
        : null,
      withPassword: isDemo,
    });
    const recruiter = await prisma.recruiter.create({
      data: { userId: user.id, organization, position, region, experience },
    });
    recruiters.push({ ...recruiter, user });
  }

  // ---------- Médias ----------
  const medias = [];
  for (const athlete of athletes) {
    const pool = PHOTOS[athlete.sportName];
    const count = athlete.isDemo ? 3 : rand() > 0.45 ? 1 : 0;
    for (let m = 0; m < count; m++) {
      const item = athlete.isDemo ? pool[m] : pick(pool);
      const createdAt = daysFromNow(-(m * 6 + Math.floor(between(1, 20))), 18);
      const media = await prisma.media.create({
        data: {
          athleteId: athlete.id,
          url: photo(item.id),
          title: item.title,
          description: null,
          type: "image",
          createdAt,
        },
      });
      medias.push({ ...media, athlete });
    }
  }
  const allUsers = [
    ...athletes.map((a) => a.user),
    ...recruiters.map((r) => r.user),
  ];
  for (const media of medias) {
    const likers = allUsers.filter(() => rand() > 0.7).slice(0, 9);
    for (const user of likers) {
      if (user.id === media.athlete.userId) continue;
      await prisma.like.create({
        data: { userId: user.id, mediaId: media.id },
      });
    }
    const views = 12 + Math.floor(between(0, 90));
    await prisma.mediaView.createMany({
      data: Array.from({ length: views }, (_, v) => ({
        mediaId: media.id,
        userId: v < 3 ? recruiters[v % recruiters.length].userId : null,
      })),
    });
  }
  const demoAthlete = athletes[0];
  const demoRecruiter = recruiters[0];
  const firstDemoMedia = medias.find((m) => m.athlete.isDemo);
  if (firstDemoMedia) {
    await prisma.comment.createMany({
      data: [
        {
          userId: demoRecruiter.userId,
          mediaId: firstDemoMedia.id,
          content: "Belle lecture du jeu sur la dernière possession.",
        },
        {
          userId: athletes[2].userId,
          mediaId: firstDemoMedia.id,
          content: "Le crossover avant le lancer, propre.",
        },
      ],
    });
  }

  // ---------- Calendrier ----------
  const EVENTS = [
    {
      d: 4,
      title: "Riverains vs Phénix",
      location: "Gymnase du Cégep des Deux-Rives, Lévis",
      color: "#1f2a44",
    },
    {
      d: 9,
      title: "Tournoi provincial collégial, ronde 1",
      location: "Centre sportif régional, Québec",
      color: "#e9b308",
    },
    {
      d: 10,
      title: "Tournoi provincial collégial, demi-finale",
      location: "Centre sportif régional, Québec",
      color: "#e9b308",
    },
    {
      d: 17,
      title: "Riverains vs Titans",
      location: "Pavillon des sports, Trois-Rivières",
      color: "#1f2a44",
    },
    {
      d: 24,
      title: "Camp d'évaluation universitaire",
      location: "Université du Littoral, Québec",
      color: "#2f6f5e",
    },
    {
      d: -3,
      title: "Riverains vs Dynamiques",
      location: "Gymnase du Cégep des Deux-Rives, Lévis",
      color: "#1f2a44",
    },
  ];
  for (const event of EVENTS) {
    const created = await prisma.event.create({
      data: {
        athleteId: demoAthlete.id,
        title: event.title,
        location: event.location,
        eventDate: daysFromNow(event.d, 19),
        endDate: daysFromNow(event.d, 21),
        isPublic: true,
        requiresParentalApproval: false,
        color: event.color,
      },
    });
    if (event.d === 4 || event.d === 24) {
      await prisma.invitation.create({
        data: {
          eventId: created.id,
          recruiterId: demoRecruiter.id,
          isIncognito: false,
          status: "ACCEPTED",
        },
      });
    }
  }
  for (const athlete of athletes.slice(1, 9)) {
    await prisma.event.create({
      data: {
        athleteId: athlete.id,
        title: `Match de saison régulière`,
        location: `${athlete.city}, ${athlete.region}`,
        eventDate: daysFromNow(2 + Math.floor(between(0, 20)), 19),
        isPublic: true,
        requiresParentalApproval: false,
        color: "#1f2a44",
      },
    });
  }

  // ---------- Messages et suivis ----------
  const thread = [
    [
      demoRecruiter.userId,
      demoAthlete.userId,
      -6,
      "Bonjour Maëlle, j'ai vu ton match contre les Dynamiques. Ta gestion du tempo en fin de quart était très mature.",
    ],
    [
      demoAthlete.userId,
      demoRecruiter.userId,
      -6,
      "Merci beaucoup ! On a beaucoup travaillé la sortie de pression cette saison.",
    ],
    [
      demoRecruiter.userId,
      demoAthlete.userId,
      -5,
      "Ça paraît. On organise un camp d'évaluation le mois prochain, je t'ai ajoutée à la liste.",
    ],
    [
      demoAthlete.userId,
      demoRecruiter.userId,
      -2,
      "Parfait, je serai là. Est-ce que je dois apporter quelque chose de particulier ?",
    ],
    [
      demoRecruiter.userId,
      demoAthlete.userId,
      -1,
      "Juste tes souliers et ton relevé de notes. Je passe aussi te voir jouer jeudi contre le Phénix.",
    ],
  ];
  for (const [senderId, recipientId, d, content] of thread) {
    await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
        createdAt: daysFromNow(d, 15),
        isRead: d < -1,
      },
    });
  }
  for (const [i, recruiter] of recruiters.slice(1).entries()) {
    const athlete = athletes[[2, 8, 14, 19][i]];
    await prisma.message.create({
      data: {
        senderId: recruiter.userId,
        recipientId: athlete.userId,
        content:
          "Bonjour, ton profil a retenu mon attention. Aurais-tu ton calendrier des prochaines semaines ?",
        createdAt: daysFromNow(-3 - i, 11),
      },
    });
  }
  for (const recruiter of recruiters) {
    for (const athlete of athletes.filter(
      (a) => a.sportName === "BASKETBALL" || rand() > 0.7,
    )) {
      await prisma.follow.create({
        data: { followerId: recruiter.userId, followingId: athlete.userId },
      });
      await prisma.activity.create({
        data: {
          userId: athlete.userId,
          actorId: recruiter.userId,
          type: "RECRUITER_VIEW",
          createdAt: daysFromNow(-Math.floor(between(0, 10)), 14),
        },
      });
    }
  }
  await prisma.notification.createMany({
    data: [
      {
        userId: demoAthlete.userId,
        athleteId: demoAthlete.id,
        message:
          "Karim Benali a confirmé sa présence à « Riverains vs Phénix ».",
        createdAt: daysFromNow(-1, 16),
      },
      {
        userId: demoAthlete.userId,
        athleteId: demoAthlete.id,
        message: "Tu passes 2e au classement basketball.",
        createdAt: daysFromNow(-2, 9),
      },
      {
        userId: demoAthlete.userId,
        athleteId: demoAthlete.id,
        message: "Nouveau badge : 10 matchs documentés.",
        createdAt: daysFromNow(-8, 20),
        isRead: true,
      },
    ],
  });

  console.log(
    `Démo prête : ${athletes.length} athlètes, ${recruiters.length} recruteurs, ${medias.length} médias.\n` +
      `Connexion : athlete@${DEMO_DOMAIN} ou recruteur@${DEMO_DOMAIN}, mot de passe « ${DEMO_PASSWORD} ».`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
