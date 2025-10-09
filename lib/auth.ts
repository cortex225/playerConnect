import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : ["http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,

    async sendResetPassword(data, request) {
      // Send an email to the user with a link to reset their password
      console.log("Reset password email:", data);
    },
  },
  // TODO: Migrer vers la nouvelle API de hooks de better-auth
  /* hooks: {
    async afterUserCreated(user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: user.user_metadata?.role?.toUpperCase() || "USER" },
      });
    },
    async afterUserUpdated(user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: user.user_metadata?.role?.toUpperCase() || "USER" },
      });
    },
    async afterSignIn(user, session, req) {
      // Vérifier s'il y a un cookie selectedRole (pour Google OAuth)
      const cookies = req?.headers?.cookie;
      if (cookies) {
        const selectedRoleMatch = cookies.match(/selectedRole=([^;]+)/);
        if (selectedRoleMatch) {
          const selectedRole = selectedRoleMatch[1];
          console.log(
            `[Auth Hook] Rôle détecté dans le cookie: ${selectedRole}`,
          );

          // Mettre à jour le rôle dans la base de données
          await prisma.user.update({
            where: { id: user.id },
            data: { role: selectedRole.toUpperCase() },
          });

          console.log(
            `[Auth Hook] Rôle mis à jour pour l'utilisateur ${user.id}: ${selectedRole}`,
          );
        }
      }
    },
  }, */
  roles: {
    enabled: true,
    defaultRole: "user",
    roles: {
      admin: {
        permissions: [
          "create:user",
          "delete:user",
          "read:user",
          "update:user",
          "manage:roles",
          "view:analytics",
          "manage:system",
        ],
      },
      athlete: {
        permissions: [
          "view:profile",
          "update:profile",
          "create:media",
          "delete:media",
          "manage:events",
          "view:recruiters",
          "respond:invitations",
          "update:performance",
        ],
      },
      recruiter: {
        permissions: [
          "view:profile",
          "update:profile",
          "view:athletes",
          "send:invitations",
          "manage:invitations",
          "view:events",
          "create:notes",
        ],
      },
      user: {
        permissions: ["view:profile", "update:profile"],
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified,
        };
      },
    },
  },
});
