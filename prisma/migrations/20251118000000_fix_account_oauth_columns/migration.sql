-- Migration de correction pour s'assurer que les colonnes OAuth existent
-- Cette migration est idempotente et peut être exécutée plusieurs fois sans problème

-- 1. Ajouter accountId si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'accountId'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "accountId" TEXT;
    END IF;
END $$;

-- 2. Ajouter providerId si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'providerId'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "providerId" TEXT;
    END IF;
END $$;

-- 3. Supprimer l'ancien index s'il existe
DROP INDEX IF EXISTS "accounts_provider_providerAccountId_key";
DROP INDEX IF EXISTS "accounts_providerId_accountId_key";

-- 4. Supprimer l'ancienne contrainte unique si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'accounts_providerId_accountId_key'
    ) THEN
        ALTER TABLE "accounts" DROP CONSTRAINT "accounts_providerId_accountId_key";
    END IF;
END $$;

-- 5. Mettre à jour les enregistrements existants avec des valeurs par défaut si nécessaire
-- Ceci est nécessaire avant d'ajouter la contrainte NOT NULL
UPDATE "accounts"
SET "accountId" = 'legacy-' || "id"
WHERE "accountId" IS NULL;

UPDATE "accounts"
SET "providerId" = 'unknown'
WHERE "providerId" IS NULL;

-- 6. Ajouter les contraintes NOT NULL
ALTER TABLE "accounts" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "accounts" ALTER COLUMN "providerId" SET NOT NULL;

-- 7. Recréer l'index unique
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_providerId_accountId_key"
ON "accounts"("providerId", "accountId");

-- 8. S'assurer que les autres colonnes OAuth existent
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'accessToken'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "accessToken" TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'refreshToken'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "refreshToken" TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'idToken'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "idToken" TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'accessTokenExpiresAt'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'sessionState'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "sessionState" TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'tokenType'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "tokenType" TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'accounts'
        AND column_name = 'scope'
    ) THEN
        ALTER TABLE "accounts" ADD COLUMN "scope" TEXT;
    END IF;
END $$;
