import { PrismaClient } from "@prisma/client";

import "server-only";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  // Middleware pour synchroniser les rôles
  prisma.$use(async (params, next) => {
    const result = await next(params);

    // Synchroniser le rôle lors de la création ou mise à jour d'un utilisateur
    if (
      params.model === "User" &&
      (params.action === "create" || params.action === "update")
    ) {
      if (result?.user_metadata?.role) {
        await prisma.user.update({
          where: { id: result.id },
          data: { role: result.user_metadata.role.toUpperCase() },
        });
      }
    }

    return result;
  });

  return prisma;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
