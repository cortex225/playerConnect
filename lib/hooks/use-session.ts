import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import type { UserSession } from "@/lib/session";

/**
 * Hook client pour récupérer la session utilisateur
 * IMPORTANT: Utilise BetterAuth côté client et fait un appel API pour les détails
 */
export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // ✅ CORRECTION: Utiliser BetterAuth côté client
        const betterAuthSession = await authClient.getSession();

        if (!betterAuthSession?.data?.user) {
          if (isMounted) {
            setSession(null);
            setLoading(false);
          }
          return;
        }

        // Faire un appel API pour obtenir les détails complets de la session
        // (rôle, permissions depuis la DB)
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch session details");
        }

        const sessionData = await response.json();

        if (isMounted) {
          setSession(sessionData);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        if (isMounted) {
          setSession(null);
          setError(error as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Nettoyer l'effet en cas de démontage du composant
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session?.isLoggedIn,
    user: session,
    error,
  };
}
