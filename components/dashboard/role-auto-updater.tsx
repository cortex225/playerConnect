"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ROLES } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/use-auth";

export function RoleAutoUpdater() {
  const { user, updateRole, loading } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function handleRoleUpdate() {
      // Si l'utilisateur n'a pas de rôle défini (USER)
      if (user && user.role === ROLES.USER && !loading && !isUpdating) {
        setIsUpdating(true);

        // Chercher le cookie selectedRole
        const cookies = document.cookie.split(";");
        const selectedRoleCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("selectedRole="),
        );

        if (selectedRoleCookie) {
          const selectedRole = selectedRoleCookie.split("=")[1];
          console.log(
            `[RoleAutoUpdater] Mise à jour automatique du rôle: ${selectedRole}`,
          );

          try {
            const success = await updateRole(
              selectedRole === "ATHLETE" ? ROLES.ATHLETE : ROLES.RECRUITER,
            );

            if (success) {
              // Supprimer le cookie
              document.cookie =
                "selectedRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

              // Rediriger vers le bon dashboard
              const dashboardPath =
                selectedRole === "ATHLETE"
                  ? "/dashboard/athlete"
                  : "/dashboard/recruiter";

              console.log(
                `[RoleAutoUpdater] Redirection vers: ${dashboardPath}`,
              );
              router.push(dashboardPath);
            }
          } catch (error) {
            console.error(
              "[RoleAutoUpdater] Erreur lors de la mise à jour du rôle:",
              error,
            );
          }
        }

        setIsUpdating(false);
      }
    }

    handleRoleUpdate();
  }, [user, loading, updateRole, router, isUpdating]);

  // Si l'utilisateur a le rôle USER et qu'on met à jour, afficher un loader
  if (user?.role === ROLES.USER && (loading || isUpdating)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">
          Configuration de votre profil...
        </p>
      </div>
    );
  }

  // Si l'utilisateur a toujours le rôle USER après tentative de mise à jour
  if (user?.role === ROLES.USER && !loading && !isUpdating) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-lg font-semibold">Configuration du profil</p>
        <p className="text-muted-foreground">
          Votre rôle n'a pas pu être déterminé automatiquement.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Veuillez contacter le support ou vous reconnecter.
        </p>
      </div>
    );
  }

  // Rendu normal pour les utilisateurs avec un rôle défini
  return null;
}
