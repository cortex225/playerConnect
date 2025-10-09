import { createAuthClient } from "better-auth/client";

// URL de base de l'application
const baseURL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

console.log("[BetterAuth] Initialisation avec baseURL:", baseURL);

// Création du client d'authentification
export const authClient = createAuthClient({
  baseURL,
});

// Export des fonctions d'authentification
export const { signIn, signOut, signUp, useSession } = authClient;

console.log("[BetterAuth] Client initialisé");
