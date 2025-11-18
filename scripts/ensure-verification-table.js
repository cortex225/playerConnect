#!/usr/bin/env node
/**
 * Script pour s'assurer que toutes les tables et colonnes nécessaires existent
 * Ce script est idempotent et peut être exécuté plusieurs fois sans problème
 *
 * IMPORTANT: Ce script s'exécute APRÈS les migrations Prisma pour réparer
 * les problèmes de schéma qui pourraient exister en production
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Helper function to check if a column exists
 */
async function columnExists(prisma, tableName, columnName) {
  const result = await prisma.$queryRawUnsafe(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
    );
  `, tableName, columnName);
  return result[0]?.exists || false;
}

/**
 * Helper function to check if a table exists
 */
async function tableExists(prisma, tableName) {
  const result = await prisma.$queryRawUnsafe(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    );
  `, tableName);
  return result[0]?.exists || false;
}

async function ensureDatabaseSchema() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Vérification du schéma de la base de données...');
    console.log('⏰ Démarrage:', new Date().toISOString());

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

    // Définir toutes les colonnes requises pour le modèle Account
    const accountColumns = [
      { name: 'userId', type: 'TEXT NOT NULL', defaultValue: null, required: true },
      { name: 'type', type: 'TEXT NOT NULL', defaultValue: "'oauth'", required: true },
      { name: 'createdAt', type: 'TIMESTAMP(3) NOT NULL', defaultValue: 'CURRENT_TIMESTAMP', required: true },
      { name: 'updatedAt', type: 'TIMESTAMP(3) NOT NULL', defaultValue: 'CURRENT_TIMESTAMP', required: true },
      { name: 'accessToken', type: 'TEXT', defaultValue: null, required: false },
      { name: 'idToken', type: 'TEXT', defaultValue: null, required: false },
      { name: 'refreshToken', type: 'TEXT', defaultValue: null, required: false },
      { name: 'scope', type: 'TEXT', defaultValue: null, required: false },
      { name: 'sessionState', type: 'TEXT', defaultValue: null, required: false },
      { name: 'tokenType', type: 'TEXT', defaultValue: null, required: false },
      { name: 'accessTokenExpiresAt', type: 'TIMESTAMP(3)', defaultValue: null, required: false },
    ];

    // Vérifier et ajouter chaque colonne si nécessaire
    for (const column of accountColumns) {
      const exists = await columnExists(prisma, 'accounts', column.name);
      if (!exists) {
        console.log(`➕ Ajout de la colonne ${column.name} à la table accounts...`);
        const defaultClause = column.defaultValue ? `DEFAULT ${column.defaultValue}` : '';
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type} ${defaultClause};
        `);
        console.log(`✅ Colonne ${column.name} ajoutée`);
      }
    }

    // Vérifier et ajouter accountId et providerId (colonnes critiques pour OAuth)
    const hasAccountId = await columnExists(prisma, 'accounts', 'accountId');
    const hasProviderId = await columnExists(prisma, 'accounts', 'providerId');

    if (!hasAccountId) {
      console.log('➕ Ajout de la colonne accountId à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
      `);
      console.log('   Mise à jour des enregistrements existants...');
      await prisma.$executeRawUnsafe(`
        UPDATE "accounts" SET "accountId" = 'legacy-' || "id" WHERE "accountId" IS NULL;
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ALTER COLUMN "accountId" SET NOT NULL;
      `);
      console.log('✅ Colonne accountId ajoutée et configurée');
    }

    if (!hasProviderId) {
      console.log('➕ Ajout de la colonne providerId à la table accounts...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
      `);
      console.log('   Mise à jour des enregistrements existants...');
      await prisma.$executeRawUnsafe(`
        UPDATE "accounts" SET "providerId" = 'unknown' WHERE "providerId" IS NULL;
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "accounts" ALTER COLUMN "providerId" SET NOT NULL;
      `);
      console.log('✅ Colonne providerId ajoutée et configurée');
    }

    // Vérifier et recréer l'index unique si nécessaire
    if (!hasAccountId || !hasProviderId) {
      console.log('🔧 Recréation de l\'index unique sur providerId et accountId...');
      await prisma.$executeRawUnsafe(`
        DROP INDEX IF EXISTS "accounts_providerId_accountId_key";
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "accounts_providerId_accountId_key"
        ON "accounts"("providerId", "accountId");
      `);
      console.log('✅ Index unique créé');
    }

    console.log('✅ Table accounts vérifiée');

    // 3. Vérifier la table sessions
    console.log('📝 Vérification de la table sessions...');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "ipAddress" TEXT,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userAgent" TEXT,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `);

    // Créer l'index unique sur sessionToken si nécessaire
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
    `);

    console.log('✅ Table sessions vérifiée');

    // 4. Vérifier la table users
    console.log('📝 Vérification de la table users...');

    // Vérifier les colonnes de la table users
    const userColumns = [
      { name: 'password', type: 'TEXT', defaultValue: null, required: false },
      { name: 'emailVerified', type: 'BOOLEAN NOT NULL', defaultValue: 'false', required: true },
    ];

    for (const column of userColumns) {
      const exists = await columnExists(prisma, 'users', column.name);
      if (!exists) {
        console.log(`➕ Ajout de la colonne ${column.name} à la table users...`);
        const defaultClause = column.defaultValue ? `DEFAULT ${column.defaultValue}` : '';
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type} ${defaultClause};
        `);
        console.log(`✅ Colonne ${column.name} ajoutée`);
      }
    }

    console.log('✅ Table users vérifiée');

    // 5. Vérifier la table verificationtokens
    console.log('📝 Vérification de la table verificationtokens...');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "verificationtokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `);

    // Créer l'index unique sur identifier et token si nécessaire
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");
    `);

    console.log('✅ Table verificationtokens vérifiée');

    // 6. Vérification finale
    console.log('🔍 Vérification finale du schéma...');
    const tables = ['verification', 'accounts', 'sessions', 'verificationtokens', 'users'];
    const tableStatuses = {};

    for (const table of tables) {
      tableStatuses[table] = await tableExists(prisma, table);
    }

    console.log('✅ Vérification finale réussie');
    console.log('⏰ Fin:', new Date().toISOString());
    console.log('\n📊 Statut des tables:');
    for (const [table, exists] of Object.entries(tableStatuses)) {
      console.log(`  - Table ${table}: ${exists ? '✅ Existe' : '❌ Manquante'}`);
    }

    // Vérifier les colonnes critiques OAuth
    const criticalColumns = ['accountId', 'providerId'];
    console.log('\n🔑 Colonnes critiques OAuth:');
    for (const col of criticalColumns) {
      const exists = await columnExists(prisma, 'accounts', col);
      console.log(`  - ${col}: ${exists ? '✅ Existe' : '❌ Manquante'}`);
    }
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
