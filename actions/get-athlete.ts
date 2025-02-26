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
    // Retourner un tableau vide au lieu de lancer une erreur
    return [];
  }
}

export async function getAthleteById(id: number) {
  try {
    const athlete = await prisma.athlete.findFirst({
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
    // Retourner null au lieu de lancer une erreur
    return null;
  }
}

export async function getTopAthletes() {
  console.log("Début de la fonction getTopAthletes");
  try {
    // D'abord, récupérer les IDs des 5 meilleurs athlètes
    console.log("Récupération des IDs des 5 meilleurs athlètes");
    let topAthleteIds;
    try {
      topAthleteIds = await prisma.performance.groupBy({
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
      console.log(`${topAthleteIds.length} IDs d'athlètes récupérés`);
    } catch (error) {
      console.error("Erreur lors de la récupération des performances:", error);
      // En cas d'erreur, retourner un tableau vide plutôt que de lancer une erreur
      return [];
    }

    if (!topAthleteIds || topAthleteIds.length === 0) {
      console.log("Aucun athlète avec des performances trouvé");
      return []; // Retourner un tableau vide plutôt que de lancer une erreur
    }

    // Ensuite, récupérer les détails complets de ces athlètes
    console.log("Récupération des détails des athlètes");
    try {
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

      console.log(`${athletes.length} athlètes récupérés avec succès`);
      return athletes;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails des athlètes:",
        error,
      );
      // En cas d'erreur, retourner un tableau vide plutôt que de lancer une erreur
      return [];
    }
  } catch (error) {
    console.error(
      "Erreur générale lors de la récupération des athlètes:",
      error,
    );
    // En cas d'erreur, retourner un tableau vide plutôt que de lancer une erreur
    return [];
  }
}
