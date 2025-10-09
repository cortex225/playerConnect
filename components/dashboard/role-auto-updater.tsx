"use client";

import { ROLES } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/use-auth";

/**
 * RoleAutoUpdater - DÉSACTIVÉ
 *
 * Ce composant causait des boucles infinies d'appels API.
 * La gestion du rôle est maintenant effectuée directement lors de :
 * 1. La création du profil athlète/recruteur (actions/create-athlete.ts)
 * 2. La récupération de session (lib/session.ts avec priorité DB)
 *
 * Le cookie selectedRole n'est plus nécessaire car le rôle est géré en base de données.
 */
export function RoleAutoUpdater() {
  // Retourner null - ce composant ne fait plus rien
  // Il est conservé pour éviter de casser les imports existants
  return null;
}
