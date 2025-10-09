import { User } from "@prisma/client";

import { Role } from "@/lib/constants";

export interface BetterAuthUserMetadata {
  role?: Role;
  permissions?: string[];
}

export interface BetterAuthUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: string;
  user_metadata?: BetterAuthUserMetadata;
}

export interface BetterAuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  user: BetterAuthUser;
}

export interface BetterAuthResponse {
  data: {
    session: BetterAuthSession;
    user: BetterAuthUser;
  } | null;
  error: Error | null;
}

export {};
