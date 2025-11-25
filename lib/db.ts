import { PrismaClient } from "@prisma/client";

// Déclaration pour le singleton Prisma
declare global {
  var cachedPrisma: PrismaClient;
}

// PrismaClient est attaché à une variable globale pour prévenir l'instanciation
// de plusieurs instances (important en dev pour le hot-reloading, et en prod pour éviter
// l'épuisement du pool de connexions)
export const prisma = global.cachedPrisma || new PrismaClient();

// Cache le singleton dans tous les environnements
global.cachedPrisma = prisma;

// Protection pour éviter l'exécution côté client
if (typeof window !== "undefined") {
  console.warn(
    "Attention: Prisma ne devrait pas être importé côté client. Utilisez des API routes ou des server components.",
  );
}

export default prisma;
