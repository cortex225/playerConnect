"use server";

import { Athlete } from "@/types";

import { prisma } from "@/lib/db";

export async function getAllAthletes() {
  try {
    const athletes = await prisma.athlete.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        sport: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        performances: {
          select: {
            id: true,
            score: true,
            date: true,
            position: {
              select: {
                name: true,
              },
            },
            KPI: {
              // Inclure les kpis ici
              select: {
                id: true,
                name: true,
                value: true,
              },
            },
          },
        },
      },
    });

    // Rechercher l'athlète avec l'id 288
    const athlete288 = athletes.find((athlete) => athlete.id === 288);

    // Afficher l'athlète en détail dans la console
    if (athlete288) {
      console.log("Athlete 288:", JSON.stringify(athlete288, null, 2));
    } else {
      console.log("Athlete with id 288 not found.");
    }

    return athletes;
  } catch (error) {
    console.error("Erreur lors de la récupération des athlètes :", error);
    throw new Error("Impossible de récupérer les athlètes");
  }
}

export async function getAthleteById(id: number) {
  try {
    const athlete = await prisma.athlete.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true, // Inclure les informations de l'utilisateur associé
        sport: true, // Inclure les informations du sport associé
      },
    });
    return athlete;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'athlète:", error);
    throw new Error("Erreur lors de la récupération de l'athlète");
  }
}

export async function getTopAthletes() {
  try {
    // D'abord, récupérer les IDs des 5 meilleurs athlètes
    const topAthleteIds = await prisma.performance.groupBy({
      by: ["athleteId"],
      _max: {
        score: true,
      },
      orderBy: {
        _max: {
          score: "desc",
        },
      },
      take: 5,
    });

    // Ensuite, récupérer les détails complets de ces athlètes
    const athletes = await prisma.athlete.findMany({
      where: {
        id: {
          in: topAthleteIds.map((a) => a.athleteId),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        sport: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        performances: {
          select: {
            id: true,
            score: true,
            date: true,
            position: {
              select: {
                name: true,
              },
            },
            KPI: {
              select: {
                id: true,
                name: true,
                value: true,
              },
            },
          },
          orderBy: {
            score: "desc",
          },
          take: 1,
        },
      },
    });

    return athletes;
  } catch (error) {
    console.error("Erreur lors de la récupération des athlètes :", error);
    throw new Error("Impossible de récupérer les athlètes");
  }
}
