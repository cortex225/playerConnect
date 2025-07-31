"use server";

import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/constants";
import type { UserSession } from "@/lib/session";

/**
 * Version spécialement conçue pour les API routes
 * Utilise directement les cookies Next.js
 */
export async function getCurrentUserAPI(): Promise<UserSession | null> {
  try {
    // Récupérer les cookies directement
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token");

    console.log("[API Session] Token trouvé:", !!sessionToken);
    if (sessionToken) {
      console.log("[API Session] Token value:", sessionToken.value);
    }

    if (!sessionToken) {
      console.log("[API Session] Pas de token de session");
      return null;
    }

    // Chercher la session dans la base de données directement
    const { prisma } = await import("@/lib/db");

    // Le cookie better-auth.session_token contient généralement l'ID de session
    // Chercher d'abord par ID de session
    let session = await prisma.session.findUnique({
      where: {
        id: sessionToken.value,
      },
      include: {
        user: true,
      },
    });

    // Si pas trouvé par ID, chercher par token
    if (!session) {
      console.log(
        "[API Session] Session non trouvée par ID, recherche par token...",
      );
      session = await prisma.session.findFirst({
        where: {
          token: sessionToken.value,
          expiresAt: {
            gt: new Date(), // Pas expirée
          },
        },
        include: {
          user: true,
        },
      });
    }

    // Vérifier si la session n'est pas expirée (pour le cas où on a trouvé par ID)
    if (session && session.expiresAt <= new Date()) {
      console.log("[API Session] Session expirée");
      return null;
    }

    if (!session) {
      console.log("[API Session] Session non trouvée ou expirée");
      return null;
    }

    console.log(
      "[API Session] Session trouvée pour utilisateur:",
      session.user.id,
    );

    // Déterminer les permissions selon le rôle
    let permissions: string[] = [];
    switch (session.user.role) {
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

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user.role as Role) || ROLES.USER,
      permissions,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("[API Session] Erreur:", error);
    return null;
  }
}
