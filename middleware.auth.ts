import authConfig from "@/auth.config";
import NextAuth from "next-auth";

export const { auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  // Ne pas utiliser l'adaptateur Prisma ici
});
