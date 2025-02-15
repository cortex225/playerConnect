import { auth } from '@/lib/auth';
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { url } from 'inspector';

interface Credentials {
  email: string;
  password: string;
  role: string;
}

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials: Credentials) {
        try {
          if (!credentials?.email || !credentials?.password || !credentials?.role) {
            console.log("Missing credentials:", { email: !!credentials?.email, password: !!credentials?.password, role: !!credentials?.role });
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase()
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true
            }
          });

          console.log("Found user:", { ...user, password: user?.password ? '[REDACTED]' : null });

          if (!user?.password) {
            console.log("User not found or no password set");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("Password validation result:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          // Si l'utilisateur n'a pas de rôle, on lui assigne celui choisi
          if (user.role === UserRole.USER) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: credentials.role as UserRole },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          url:"https://xbtwvljymsmlhvdbvkyw.supabase.co/auth/v1/callback",
        }
      }
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: "SaaS Starter App <onboarding@resend.dev>",
    }),
  ],
} satisfies NextAuthConfig;
