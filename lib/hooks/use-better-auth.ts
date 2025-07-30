import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BetterAuthUser, BetterAuthUserMetadata } from "@/types/better-auth";
import { authClient } from "@/lib/auth-client";
import { ROLES, type Role } from "@/lib/constants";

export type UserState = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  permissions: string[];
  isLoggedIn: boolean;
  metadata?: BetterAuthUserMetadata;
} | null;

export function useBetterAuth() {
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authClient.getSession();

      if (!response?.data?.user) {
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      const authUser = response.data.user as unknown as BetterAuthUser;

      // Récupérer le rôle depuis les métadonnées ou le champ role ou valeur par défaut
      const roleFromMetadata = authUser.user_metadata?.role?.toUpperCase();
      const roleFromUser = authUser.role?.toUpperCase();

      const role: Role =
        roleFromMetadata &&
        Object.values(ROLES).includes(roleFromMetadata as Role)
          ? (roleFromMetadata as Role)
          : roleFromUser && Object.values(ROLES).includes(roleFromUser as Role)
            ? (roleFromUser as Role)
            : ROLES.USER;

      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role,
        permissions: [],
        isLoggedIn: true,
        metadata: authUser.user_metadata,
      });
      setError(null);
    } catch (error) {
      console.error("Erreur récupération session:", error);
      setUser(null);
      setError("Erreur lors de la récupération de la session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Récupérer à nouveau les données utilisateur lorsque la fenêtre est focalisée
    const handleFocus = () => {
      fetchUser();
    };

    // Rafraîchir régulièrement la session (toutes les 5 minutes)
    const intervalId = setInterval(fetchUser, 5 * 60 * 1000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.refresh();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  }, [router]);

  const refreshUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user?.isLoggedIn,
    refreshUser,
    signOut,
  };
}
