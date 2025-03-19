import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"

export const runtime = "nodejs"

const handler = NextAuth(authConfig)

export const { auth, signIn, signOut } = handler
export const GET = handler
export const POST = handler 