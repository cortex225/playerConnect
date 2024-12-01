import { faker } from "@faker-js/faker";
import {
  CategoryLevel,
  PrismaClient,
  SportType,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Étape 1 : Créer les sports
  const sportTypes = Object.values(SportType); // Les types de sports définis dans l'enum
  const sports = await Promise.all(
    sportTypes.map(async (sportType) => {
      return prisma.sport.upsert({
        where: { name: sportType },
        update: {},
        create: { name: sportType },
      });
    }),
  );
  console.log(
    "Sports seeded:",
    sports.map((s) => s.name),
  );

  // Étape 2 : Créer les positions pour chaque sport
  for (const sport of sports) {
    let positions = [];

    switch (sport.name) {
      case SportType.BASKETBALL:
        positions = [
          "POINT_GUARD",
          "SHOOTING_GUARD",
          "SMALL_FORWARD",
          "POWER_FORWARD",
          "CENTER",
        ];
        break;
      case SportType.SOCCER:
        positions = ["FORWARD", "MIDFIELDER", "DEFENDER", "GOALKEEPER"];
        break;
      case SportType.FOOTBALL:
        positions = [
          "QUARTERBACK",
          "RUNNING_BACK",
          "WIDE_RECEIVER",
          "TIGHT_END",
          "OFFENSIVE_LINE",
          "LINEBACKER",
          "DEFENSIVE_LINE",
          "CORNERBACK",
          "SAFETY",
          "KICKER",
          "PUNTER",
        ];
        break;
      case SportType.RUGBY:
        positions = ["PROP", "HOOKER", "LOCK", "FLANKER", "NUMBER_EIGHT"];
        break;
      default:
        break;
    }

    for (const position of positions) {
      await prisma.position.upsert({
        where: {
          name_sportId: {
            // Clé composite générée par Prisma
            name: position,
            sportId: sport.id,
          },
        },
        update: {},
        create: {
          name: position,
          sportId: sport.id,
        },
      });
    }
  }
  console.log("Positions seeded.");

  // Étape 3 : Créer les niveaux et catégories
  const levels = ["Scolaire", "Collégial", "Universitaire"];
  for (const sport of sports) {
    for (const levelName of levels) {
      const level = await prisma.level.upsert({
        where: {
          name_sportId: {
            // Clé composite générée par Prisma
            name: levelName, // Le nom du niveau (ex. "Scolaire")
            sportId: sport.id, // L'ID du sport associé
          },
        },
        update: {},
        create: {
          name: levelName,
          sportId: sport.id,
        },
      });

      // Associer les catégories à chaque niveau
      const categories = Object.values(CategoryLevel);
      for (const category of categories) {
        await prisma.category.upsert({
          where: {
            name_levelId: {
              // Utilisation de la clé composite générée par Prisma
              name: category, // Nom de la catégorie (ex. "BENJAMIN")
              levelId: level.id, // ID du niveau associé (ex. "Scolaire")
            },
          },
          update: {},
          create: {
            name: category,
            levelId: level.id,
          },
        });
      }
    }
  }
  console.log("Levels and Categories seeded.");

  // Étape 4 : Créer des utilisateurs et athlètes
  const athletes = [];
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.ATHLETE,
      },
    });

    const randomSport = sports[Math.floor(Math.random() * sports.length)];
    const randomCategory = await prisma.category.findFirst({
      where: { level: { sportId: randomSport.id } },
    });

    const athlete = await prisma.athlete.create({
      data: {
        userId: user.id,
        gender: faker.helpers.arrayElement(["MASCULIN", "FEMININ"]),
        age: faker.number.int({ min: 18, max: 40 }),
        city: faker.location.city(),
        height: faker.number.int({ min: 150, max: 210 }),
        weight: faker.number.int({ min: 50, max: 100 }),
        programType: faker.helpers.arrayElement(["CIVILE", "SCOLAIRE"]),
        categoryId: randomCategory?.id || null,
        sportId: randomSport.id,
      },
    });
    athletes.push(athlete);
  }
  console.log("Athletes seeded.");

  // Étape 5 : Créer des performances et KPI pour chaque athlète
  for (const athlete of athletes) {
    const athletePositions = await prisma.position.findMany({
      where: { sportId: athlete.sportId },
    });

    for (let i = 0; i < 3; i++) {
      const randomPosition =
        athletePositions[Math.floor(Math.random() * athletePositions.length)];

      const performance = await prisma.performance.create({
        data: {
          athleteId: athlete.id,
          positionId: randomPosition.id,
          date: faker.date.past(),
          score: faker.number.float({ min: 0, max: 100 }),
        },
      });

      // Ajouter des KPI à cette performance
      for (let j = 0; j < 5; j++) {
        await prisma.kPI.create({
          data: {
            name: `KPI ${j + 1}`,
            weight: faker.number.float({ min: 0.1, max: 1 }),
            value: faker.number.float({ min: 0, max: 100 }),
            positionId: randomPosition.id,
            performanceId: performance.id,
          },
        });
      }
    }
  }
  console.log("Performances and KPIs seeded.");

  // Étape 6 : Créer des recruteurs
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.RECRUITER,
      },
    });

    await prisma.recruiter.create({
      data: {
        userId: user.id,
        organization: faker.company.name(),
        position: faker.person.jobTitle(),
        region: faker.location.state(),
        experience: faker.number.int({ min: 0, max: 30 }),
      },
    });
  }
  console.log("Recruiters seeded.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
