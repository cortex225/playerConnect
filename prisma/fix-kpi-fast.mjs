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
  console.log("Fixing KPI names (batch)...");

  // Get all athletes with their sport
  const athletes = await prisma.athlete.findMany({
    select: { id: true, sport: { select: { name: true } } },
  });

  for (const athlete of athletes) {
    const sportName = athlete.sport?.name || "BASKETBALL";
    const names = sportKPIs[sportName] || sportKPIs.BASKETBALL;

    // Update all KPIs for this athlete in batch
    for (let i = 0; i < names.length; i++) {
      await prisma.$executeRawUnsafe(
        `UPDATE kpis SET name = $1 WHERE name = $2 AND "performanceId" IN (SELECT id FROM performances WHERE "athleteId" = $3)`,
        names[i],
        `KPI ${i + 1}`,
        athlete.id
      );
    }
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
