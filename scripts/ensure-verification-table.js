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

    // Vérifier si la colonne userId existe
    const userIdExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'userId'
      );
    `);

    if (!userIdExists[0].exists) {
      console.log('➕ Ajout de la colonne userId à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';
      `);
    }

    // Vérifier si la colonne type existe
    const typeExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'type'
      );
    `);

    if (!typeExists[0].exists) {
      console.log('➕ Ajout de la colonne type à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'oauth';
      `);
    }

    // Vérifier si la colonne createdAt existe
    const createdAtExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'createdAt'
      );
    `);

    if (!createdAtExists[0].exists) {
      console.log('➕ Ajout de la colonne createdAt à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      `);
    }

    // Vérifier si la colonne updatedAt existe
    const updatedAtExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'updatedAt'
      );
    `);

    if (!updatedAtExists[0].exists) {
      console.log('➕ Ajout de la colonne updatedAt à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      `);
    }

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

    // Vérifier si la colonne accountId existe
    const accountIdExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'accountId'
      );
    `);

    if (!accountIdExists[0].exists) {
      console.log('➕ Ajout de la colonne accountId à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accountId" TEXT NOT NULL DEFAULT '';
      `);
    }

    // Vérifier si la colonne providerId existe
    const providerIdExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'providerId'
      );
    `);

    if (!providerIdExists[0].exists) {
      console.log('➕ Ajout de la colonne providerId à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "providerId" TEXT NOT NULL DEFAULT '';
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
