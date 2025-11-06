#!/usr/bin/env node
/**
 * Script pour s'assurer que toutes les tables et colonnes nécessaires existent
 * Ce script est idempotent et peut être exécuté plusieurs fois sans problème
 */

const { PrismaClient } = require('@prisma/client');

async function ensureDatabaseSchema() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Vérification du schéma de la base de données...');

    // 1. Créer la table verification si elle n'existe pas
    console.log('📝 Vérification de la table verification...');
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
    console.log('✅ Table verification vérifiée');

    // 2. Vérifier et ajouter les colonnes manquantes dans la table accounts
    console.log('📝 Vérification de la table accounts...');

    // Vérifier si la colonne accessToken existe
    const accessTokenExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'accessToken'
      );
    `);

    if (!accessTokenExists[0].exists) {
      console.log('➕ Ajout de la colonne accessToken à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
      `);
    }

    // Vérifier si la colonne idToken existe
    const idTokenExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'idToken'
      );
    `);

    if (!idTokenExists[0].exists) {
      console.log('➕ Ajout de la colonne idToken à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "idToken" TEXT;
      `);
    }

    // Vérifier si la colonne refreshToken existe
    const refreshTokenExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'refreshToken'
      );
    `);

    if (!refreshTokenExists[0].exists) {
      console.log('➕ Ajout de la colonne refreshToken à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
      `);
    }

    // Vérifier si la colonne scope existe
    const scopeExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'scope'
      );
    `);

    if (!scopeExists[0].exists) {
      console.log('➕ Ajout de la colonne scope à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "scope" TEXT;
      `);
    }

    // Vérifier si la colonne sessionState existe
    const sessionStateExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'sessionState'
      );
    `);

    if (!sessionStateExists[0].exists) {
      console.log('➕ Ajout de la colonne sessionState à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "sessionState" TEXT;
      `);
    }

    // Vérifier si la colonne tokenType existe
    const tokenTypeExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'tokenType'
      );
    `);

    if (!tokenTypeExists[0].exists) {
      console.log('➕ Ajout de la colonne tokenType à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "tokenType" TEXT;
      `);
    }

    // Vérifier si la colonne accessTokenExpiresAt existe
    const accessTokenExpiresAtExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'accessTokenExpiresAt'
      );
    `);

    if (!accessTokenExpiresAtExists[0].exists) {
      console.log('➕ Ajout de la colonne accessTokenExpiresAt à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
      `);
    }

    console.log('✅ Table accounts vérifiée');

    // 3. Vérification finale
    console.log('🔍 Vérification finale du schéma...');
    const verificationExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'verification'
      );
    `);

    const accountsExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
      );
    `);

    console.log('✅ Vérification finale réussie');
    console.log('  - Table verification:', verificationExists[0].exists ? '✓' : '✗');
    console.log('  - Table accounts:', accountsExists[0].exists ? '✓' : '✗');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du schéma:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
ensureDatabaseSchema()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Échec du script:', error);
    process.exit(1);
  });
