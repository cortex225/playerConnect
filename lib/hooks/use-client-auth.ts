"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { fetchSessionInfo, logoutUser } from "@/lib/client/api";
import { ROLES, type Role } from "@/lib/constants";

type UserState = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  isLoggedIn: boolean;
} | null;

export function useClientAuth() {
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[ClientAuth] Récupération de session...");

      // Utiliser notre helper API pour récupérer les informations de session
      const data = await fetchSessionInfo();
      console.log("[ClientAuth] Données de session:", data);

      if (!data.userSession) {
        setUser(null);
        setError(null);
        return;
      }

      // Utiliser les données de la session récupérées
      const userSession = data.userSession;

      setUser({
        id: userSession.id,
        name: userSession.name,
        email: userSession.email,
        role: userSession.role as Role,
        isLoggedIn: userSession.isLoggedIn,
      });

      setError(null);
    } catch (error) {
      console.error("[ClientAuth] Erreur:", error);
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

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    try {
      // Utiliser l'API helper pour se déconnecter
      await logoutUser();
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error("[ClientAuth] Erreur déconnexion:", error);
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
