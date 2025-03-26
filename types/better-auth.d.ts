import { User } from "@prisma/client";

import { Role } from "@/lib/constants";

interface BetterAuthUserMetadata {
  role?: Role;
  permissions?: string[];
}

interface BetterAuthUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  user_metadata?: BetterAuthUserMetadata;
}

interface BetterAuthSession {
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
