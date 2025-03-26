
import { useEffect, useState } from "react";

import { getCurrentUser, type UserSession } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        setSession(user);
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);


  return {
    session,
    loading,
    isAuthenticated: !!session?.isLoggedIn,
  };
}
