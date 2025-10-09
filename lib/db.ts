import { PrismaClient } from "@prisma/client";

// Déclaration pour le singleton Prisma
declare global {
  var cachedPrisma: PrismaClient;
}

// PrismaClient est attaché à une variable globale lorsqu'il est utilisé en développement
// pour prévenir l'instanciation de plusieurs instances pendant le hot-reloading
export const prisma = global.cachedPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}

// Protection pour éviter l'exécution côté client
if (typeof window !== "undefined") {
  console.warn(
    "Attention: Prisma ne devrait pas être importé côté client. Utilisez des API routes ou des server components.",
  );
}

export default prisma;
