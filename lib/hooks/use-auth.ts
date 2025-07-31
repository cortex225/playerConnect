import { useSession } from "./use-session";

// Hook de compatibilité qui utilise useSession en interne
export function useAuth() {
  const { session, loading, isAuthenticated, error } = useSession();
  
  return {
    session: session ? {
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        image: session.image,
      },
      role: session.role,
      permissions: session.permissions,
    } : null,
    loading,
    isAuthenticated,
    error,
  };
}
