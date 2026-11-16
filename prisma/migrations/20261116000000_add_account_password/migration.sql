-- Better Auth stocke le hash du mot de passe (fournisseur "credential") sur le compte.
-- Colonnes nullables : aucun impact sur les comptes OAuth existants.
-- Retour arrière : ALTER TABLE "accounts" DROP COLUMN "password", DROP COLUMN "refreshTokenExpiresAt";
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
