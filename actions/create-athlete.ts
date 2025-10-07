"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { AthleteFormValues } from "@/lib/validations/athlete";

/**
 * Crée un nouvel athlète en base de données
 * @param data Les informations de l'athlète à créer
 * @returns L'athlète créé ou une erreur si la création a échoué
 */
export async function createAthlete(data: AthleteFormValues) {
  try {
    const user = await getCurrentUser();
    console.log("Création athlète - user session:", user?.id, user?.role);

    // Vérification de l'utilisateur
    if (!user || !user.id) {
      console.error("Création athlète - utilisateur non authentifié");
      throw new Error("Non autorisé");
    }

    // Afficher l'identifiant utilisateur
    console.log("Création athlète - ID utilisateur:", user.id);

    // Vérifions d'abord si un athlète existe déjà pour cet utilisateur
    const existingAthlete = await prisma.athlete.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingAthlete) {
      console.log("Création athlète - profil existant:", existingAthlete.id);
      throw new Error("Un profil athlète existe déjà pour cet utilisateur");
    }

    // Log des données à insérer
    console.log("Création athlète - données:", {
      userId: user.id,
      sportId: data.sportId,
      positions: data.positions,
    });

    // Création de l'athlète
    const athlete = await prisma.athlete.create({
      data: {
        userId: user.id,
        gender: data.gender,
        age: data.age,
        city: data.city,
        height: data.height,
        weight: data.weight,
        dominantHand: data.dominantHand,
        dominantFoot: data.dominantFoot,
        programType: data.programType,
        categoryId: data.categoryId,
        sportId: data.sportId,
        positions: {
          create: data.positions.map((positionId) => ({
            position: {
              connect: {
                id: positionId,
              },
            },
          })),
        },
      },
    });

    console.log("Création athlète - succès:", athlete.id);

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ATHLETE" },
    });

    console.log("Rôle utilisateur mis à jour: ATHLETE");

    // Supprimer le cookie selectedRole car l'onboarding est terminé
    const cookieStore = await cookies();
    cookieStore.delete("selectedRole");
    console.log("Cookie selectedRole supprimé");

    // Mise à jour du cache
    // Revalider toutes les pages qui dépendent de la session/rôle
    revalidatePath("/", "layout"); // Revalide tout depuis la racine
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/athlete");
    revalidatePath("/onboarding");

    console.log("Profil athlète créé avec succès, le client va rediriger");

    // Retourner le succès et laisser le client gérer la redirection
    return { success: true, data: athlete, redirectTo: "/dashboard/athlete" };
  } catch (error) {
    console.error("Erreur création athlète:", error);
    return { success: false, error: "Erreur lors de la création de l'athlète" };
  }
}
