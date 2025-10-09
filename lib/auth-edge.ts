import { betterAuth } from "better-auth";

// Configuration allégée pour le middleware Edge Runtime
export const authEdge = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  // Pas de database adapter pour Edge Runtime
  // Les sessions seront gérées via les cookies/tokens
});
