"use server";

import { headers } from "next/headers";

import type { BetterAuthUser } from "@/types/better-auth";
import { auth } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/constants";

export type ServerUserSession = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  permissions: string[];
  isLoggedIn: boolean;
  image?: string | null;
};

/**
 * Version serveur pour obtenir la session utilisateur
 * À utiliser uniquement dans les server components, API routes ou server actions
 */
export async function getServerSession(): Promise<ServerUserSession | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return null;
    }

    const user = session.user;
    const metadata = (user as any).user_metadata || {};
    const dbRole = (user as any).role || "";

    // Déterminer le rôle à partir des métadonnées ou de la base de données
    const metadataRole = metadata.role?.toUpperCase();
    const userDbRole = dbRole?.toUpperCase();

    // Choisir le rôle
    let roleToUse: Role = ROLES.USER;
    if (metadataRole && Object.values(ROLES).includes(metadataRole as Role)) {
      roleToUse = metadataRole as Role;
    } else if (
      userDbRole &&
      Object.values(ROLES).includes(userDbRole as Role)
    ) {
      roleToUse = userDbRole as Role;
    }

    // Déterminer les permissions
    let permissions: string[] = [];
    if (metadata.permissions && Array.isArray(metadata.permissions)) {
      permissions = metadata.permissions;
    } else {
      // Permissions par défaut selon le rôle
      switch (roleToUse) {
        case ROLES.ADMIN:
          permissions = ["manage:system", "view:profile", "update:profile"];
          break;
        case ROLES.ATHLETE:
          permissions = ["view:profile", "update:profile", "view:recruiters"];
          break;
        case ROLES.RECRUITER:
          permissions = ["view:profile", "update:profile", "view:athletes"];
          break;
        default:
          permissions = ["view:profile", "update:profile"];
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: roleToUse,
      permissions,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("[ServerSession] Erreur:", error);
    return null;
  }
}
