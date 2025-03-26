import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,

    async sendResetPassword(data, request) {
      // Send an email to the user with a link to reset their password
      console.log("Reset password email:", data);
    },
  },
  hooks: {
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
  },
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
