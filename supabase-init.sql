-- Script SQL à exécuter dans Supabase SQL Editor
-- Ce script crée la table verification manquante pour better-auth

-- Créer la table verification si elle n'existe pas
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Vérifier que toutes les tables better-auth existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'accounts', 'sessions', 'verification', 'verificationtokens')
ORDER BY table_name;
