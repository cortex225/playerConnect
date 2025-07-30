import { useEffect, useState } from "react";

import { getCurrentUser, type UserSession } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // On utilise directement getCurrentUser qui utilise BetterAuth en interne
        const user = await getCurrentUser();

        if (isMounted) {
          setSession(user);
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
