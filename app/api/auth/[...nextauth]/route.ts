import NextAuth from "next-auth";

import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export { GET, POST } from "@/lib/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
});
