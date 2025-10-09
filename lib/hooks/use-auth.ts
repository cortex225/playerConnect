"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { ROLES, type Role } from "@/lib/constants";

export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  permissions: string[];
  isLoggedIn: boolean;
  image?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authClient.getSession();

      if (!response?.data?.user) {
        setState({
          user: null,
          loading: false,
          error: null,
        });
        return;
      }

      const authUser = response.data.user as any;

      // Déterminer le rôle
      const roleFromMetadata = authUser.user_metadata?.role?.toUpperCase();
      const roleFromUser = authUser.role?.toUpperCase();

      let role: Role = ROLES.USER;
      if (
        roleFromMetadata &&
        Object.values(ROLES).includes(roleFromMetadata as Role)
      ) {
        role = roleFromMetadata as Role;
      } else if (
        roleFromUser &&
        Object.values(ROLES).includes(roleFromUser as Role)
      ) {
        role = roleFromUser as Role;
      }

      // Déterminer les permissions
      let permissions: string[] = [];
      switch (role) {
        case ROLES.ADMIN:
          permissions = [
            "create:user",
            "delete:user",
            "read:user",
            "update:user",
            "manage:roles",
            "view:analytics",
            "manage:system",
          ];
          break;
        case ROLES.ATHLETE:
          permissions = [
            "view:profile",
            "update:profile",
            "create:media",
            "delete:media",
            "manage:events",
            "view:recruiters",
            "respond:invitations",
            "update:performance",
          ];
          break;
        case ROLES.RECRUITER:
          permissions = [
            "view:profile",
            "update:profile",
            "view:athletes",
            "send:invitations",
            "manage:invitations",
            "view:events",
            "create:notes",
          ];
          break;
        default:
          permissions = ["view:profile", "update:profile"];
      }

      setState({
        user: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role,
          permissions,
          isLoggedIn: true,
          image: authUser.image,
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Erreur récupération session:", error);
      setState({
        user: null,
        loading: false,
        error: "Erreur lors de la récupération de la session",
      });
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, role?: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        await authClient.signIn.email({
          email,
          password,
        });

        // Attendre un peu pour que la session soit mise à jour
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Rafraîchir les données utilisateur
        await fetchUser();

        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Erreur lors de la connexion",
        }));
        return false;
      }
    },
    [fetchUser],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string, role?: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        await authClient.signUp.email({
          email,
          password,
          name,
        });

        // Attendre un peu pour que la session soit mise à jour
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Rafraîchir les données utilisateur
        await fetchUser();

        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Erreur lors de l'inscription",
        }));
        return false;
      }
    },
    [fetchUser],
  );

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
      });
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }, [router]);

  const updateRole = useCallback(
    async (newRole: Role) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Mettre à jour le rôle via l'API
        const response = await fetch("/api/user/update-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du rôle");
        }

        // Rafraîchir les données utilisateur
        await fetchUser();

        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Erreur lors de la mise à jour du rôle",
        }));
        return false;
      }
    },
    [fetchUser],
  );

  const hasPermission = useCallback(
    (permission: string) => {
      return state.user?.permissions.includes(permission) || false;
    },
    [state.user],
  );

  const hasRole = useCallback(
    (role: Role) => {
      return state.user?.role === role;
    },
    [state.user],
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    updateRole,
    hasPermission,
    hasRole,
    refetch: fetchUser,
  };
}
