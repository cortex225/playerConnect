import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  session: {
    // Stratégie de persistance de session
    strategy: "cookie",
    // Durée de vie de la session en secondes (ici 7 jours)
    maxAge: 7 * 24 * 60 * 60,
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;

