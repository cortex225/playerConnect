"use server";

import { cookies, headers } from "next/headers";

import type { BetterAuthUser } from "@/types/better-auth";
import { auth } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/constants";

export type UserSession = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  permissions: string[];
  isLoggedIn: boolean;
  image?: string | null;
};

/**
 * Récupère la session utilisateur côté serveur
 * Cette fonction ne doit être appelée que côté serveur
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    // Récupérer la session via BetterAuth
    const headersList = await headers();
    const cookieStore = await cookies();

    console.log("[Session] Récupération de session avec les headers");
    console.log(
      "[Session] Cookies disponibles:",
      cookieStore.getAll().map((c) => `${c.name}=${c.value.slice(0, 20)}...`),
    );

    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log("[Session] Réponse de getSession:", {
      hasSession: !!session?.session,
      hasUser: !!session?.user,
      sessionId: session?.session?.id,
    });

    // Si pas de session ou pas d'utilisateur
    if (!session?.user) {
      console.log("[Session] Aucune session utilisateur trouvée");
      return null;
    }

    // Récupérer les données utilisateur
    const user = session.user;

    console.log("[Session] Données utilisateur:", {
      id: user.id,
      email: user.email,
      hasMetadata: !!(user as any).user_metadata,
    });

    // ⚡ NOUVELLE APPROCHE: Récupérer le rôle directement depuis la base de données
    const { prisma } = await import("@/lib/db");
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    // Accéder aux métadonnées de façon plus sûre
    const metadata = (user as any).user_metadata || {};
    const dbRole = dbUser?.role || (user as any).role;

    console.log("[Session] Métadonnées et rôle:", {
      metadataRole: metadata.role,
      dbRole: dbRole,
      userFromDB: !!dbUser,
    });

    // Déterminer le rôle - TOUJOURS prioriser la base de données comme source de vérité
    const userDbRole = dbRole?.toUpperCase();
    const metadataRole = metadata.role?.toUpperCase();

    // Choisir le rôle selon la priorité : DB > métadonnées > USER
    let roleToUse: Role;
    if (userDbRole && Object.values(ROLES).includes(userDbRole as Role)) {
      roleToUse = userDbRole as Role;
    } else if (metadataRole && Object.values(ROLES).includes(metadataRole as Role)) {
      roleToUse = metadataRole as Role;
    } else {
      roleToUse = ROLES.USER;
    }

    // Récupérer ou définir les permissions de base en fonction du rôle
    let permissions: string[] = [];

    // Si les permissions sont dans les métadonnées, les utiliser
    if (metadata.permissions && Array.isArray(metadata.permissions)) {
      permissions = metadata.permissions;
    }
    // Sinon utiliser les permissions par défaut selon le rôle
    else {
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

    // Construire la session utilisateur
    const userSession: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: roleToUse,
      permissions,
      isLoggedIn: true,
    };

    console.log("[Session] Session créée:", {
      userId: userSession.id,
      role: userSession.role,
      permissions: userSession.permissions.length,
    });

    return userSession;
  } catch (error) {
    console.error("[Session] Erreur:", error);
    return null;
  }
}

/**
 * Version simplifiée pour obtenir uniquement les informations de base de l'utilisateur
 * Cette fonction doit être utilisée dans les actions serveur ou API routes
 */
export async function getSessionUser() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role:
        (session.user as any).role ||
        (session.user as any).user_metadata?.role ||
        "USER",
    };
  } catch (error) {
    console.error("[SimplifiedSession] Erreur:", error);
    return null;
  }
}
