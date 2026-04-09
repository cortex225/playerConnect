import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

const sportKPIs = {
  BASKETBALL: ["Points", "Rebonds", "Passes", "Interceptions", "Contres"],
  SOCCER: ["Buts", "Passes dec.", "Tacles", "Dribbles", "Precis. tirs"],
  FOOTBALL: ["Yards", "Touchdowns", "Receptions", "Plaquages", "Interceptions"],
  RUGBY: ["Essais", "Plaquages", "Passes", "Metres", "Turnovers"],
};

async function main() {
  console.log("Fixing KPI names...");

  // Get all KPIs with generic names
  const genericKPIs = await prisma.kPI.findMany({
    where: {
      name: { startsWith: "KPI " },
    },
    include: {
      performance: {
        include: {
          athlete: {
            include: { sport: true },
          },
        },
      },
    },
  });

  console.log(`Found ${genericKPIs.length} KPIs to rename`);

  let updated = 0;
  for (const kpi of genericKPIs) {
    const sportName = kpi.performance.athlete.sport?.name || "BASKETBALL";
    const kpiNames = sportKPIs[sportName] || sportKPIs.BASKETBALL;

    // Extract the index from "KPI 1", "KPI 2", etc.
    const match = kpi.name.match(/KPI (\d+)/);
    if (match) {
      const index = parseInt(match[1]) - 1;
      const newName = kpiNames[index] || kpiNames[index % kpiNames.length];

      await prisma.kPI.update({
        where: { id: kpi.id },
        data: { name: newName },
      });
      updated++;
    }
  }

  console.log(`Updated ${updated} KPI names`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
