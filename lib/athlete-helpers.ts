import { prisma } from "@/lib/db";
import { UserSession } from "@/lib/session";

/**
 * Vérifie si un utilisateur a déjà un profil athlète
 * @param userId Identifiant de l'utilisateur
 * @returns Le profil athlète s'il existe, null sinon
 */
export async function getUserAthleteProfile(userId: string) {
  if (!userId) return null;

  try {
    const athlete = await prisma.athlete.findUnique({
      where: {
        userId,
      },
      include: {
        sport: true,
        user: true,
      },
    });

    return athlete;
  } catch (error) {
    console.error("Erreur lors de la vérification du profil athlète:", error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur doit compléter le formulaire de profil athlète
 * @param user Session utilisateur
 * @returns true si l'utilisateur doit compléter son profil, false sinon
 */
export async function shouldCompleteAthleteProfile(user: UserSession | null) {
  if (!user) return false;

  // Si l'utilisateur a déjà le rôle ATHLETE, on vérifie s'il a bien un profil
  if (user.role === "ATHLETE") {
    const hasProfile = await getUserAthleteProfile(user.id);
    return !hasProfile; // S'il n'a pas de profil, il doit le compléter
  }

  // Si l'utilisateur n'est pas un athlète, il n'a pas besoin de compléter le profil
  return false;
}
