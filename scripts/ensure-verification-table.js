#!/usr/bin/env node
/**
 * Script pour s'assurer que la table verification existe dans la base de données
 * Ce script est idempotent et peut être exécuté plusieurs fois sans problème
 */

const { PrismaClient } = require('@prisma/client');

async function ensureVerificationTable() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Vérification de l\'existence de la table verification...');

    // Tenter de créer la table si elle n'existe pas
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT NOT NULL,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('✅ Table verification vérifiée et créée si nécessaire');

    // Vérifier que la table existe maintenant
    const result = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'verification'
      );
    `);

    console.log('✅ Vérification finale réussie:', result);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la table verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
ensureVerificationTable()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Échec du script:', error);
    process.exit(1);
  });
