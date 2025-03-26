import type { BetterAuthResponse } from "@/types/better-auth";
import { authClient } from "@/lib/auth-client";
import { ROLES, type Role } from "@/lib/constants";

export type UserSession = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  permissions: string[];
  isLoggedIn: boolean;
};

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const response = await authClient.getSession();

    // Si pas de session ou erreur
    if (!response?.data?.user) {
      return null;
    }

    // Récupérer le rôle et les permissions depuis les métadonnées de l'utilisateur
    const user = response.data.user;
    const roleFromMetadata = user.user_metadata?.role?.toUpperCase();
    const role = Object.values(ROLES).includes(roleFromMetadata as Role)
      ? (roleFromMetadata as Role)
      : ROLES.USER;
    const permissions = user.user_metadata?.permissions || [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      permissions,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
