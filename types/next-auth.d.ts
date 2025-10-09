import { User } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      role: "admin" | "athlete" | "recruiter" | "user";
      permissions: string[];
    } & Partial<User>;
  }
}

export {};
