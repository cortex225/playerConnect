# Correctif pour les erreurs de schéma de base de données

## Problèmes

En production sur Vercel, plusieurs erreurs se produisent lors de la connexion :

### 1. Table verification manquante
```
Invalid `prisma.verification.create()` invocation:
The table `public.verification` does not exist in the current database.
```

### 2. Colonnes manquantes dans la table accounts
```
Invalid `prisma.account.findMany()` invocation:
The column `accounts.accessToken` does not exist in the current database.
```

## Cause

Ces erreurs se produisent lorsque les migrations Prisma ne sont pas exécutées correctement lors du déploiement sur Vercel, ou si les tables/colonnes ont été supprimées accidentellement de la base de données de production. Cela peut arriver dans les cas suivants :

- Les migrations Prisma échouent silencieusement pendant le build
- Le schéma de la base de données est désynchronisé avec le schéma Prisma
- Des colonnes ont été ajoutées au schéma mais la base de données n'a pas été mise à jour

## Solution

Nous avons mis en place un script de vérification idempotent qui s'assure que toutes les tables et colonnes nécessaires existent avant chaque build.

### Fichiers modifiés

1. **scripts/ensure-verification-table.js** (nouveau/mis à jour)
   - Script Node.js qui vérifie et crée/met à jour les tables et colonnes
   - Crée la table `verification` si elle n'existe pas
   - Ajoute les colonnes manquantes à la table `accounts` :
     - `accessToken`
     - `idToken`
     - `refreshToken`
     - `scope`
     - `sessionState`
     - `tokenType`
     - `accessTokenExpiresAt`
     - `accountId`
     - `providerId`
   - Utilise `CREATE TABLE IF NOT EXISTS` et `ADD COLUMN IF NOT EXISTS` pour être idempotent
   - Vérifie l'existence des tables après création/modification

2. **vercel.json**
   - Ajout du script dans le `buildCommand`
   - Ordre d'exécution : migrations → génération Prisma → vérification table → build

3. **package.json**
   - Ajout du script dans le script `build`
   - Nouveau script `db:ensure-verification` pour exécution manuelle

### Ordre d'exécution des commandes de build

```bash
prisma migrate deploy        # Exécute toutes les migrations
prisma generate              # Génère le client Prisma
node scripts/ensure-verification-table.js  # Vérifie/crée la table verification
contentlayer build           # Build du contenu
next build                   # Build de l'application Next.js
```

## Exécution manuelle

Si vous devez exécuter le script manuellement :

```bash
pnpm db:ensure-verification
```

Ou directement :

```bash
node scripts/ensure-verification-table.js
```

## Variables d'environnement requises

Assurez-vous que les variables suivantes sont configurées sur Vercel :

- `DATABASE_URL` : URL de connexion à la base de données PostgreSQL
- `DIRECT_URL` : URL de connexion directe (pour Neon ou autres providers poolés)

## Vérification en production

Après déploiement, vérifiez dans les logs de build Vercel que vous voyez :

```
✅ Table verification vérifiée et créée si nécessaire
✅ Vérification finale réussie
```

## Notes importantes

- Le script est **idempotent** : il peut être exécuté plusieurs fois sans effets secondaires
- Il utilise `CREATE TABLE IF NOT EXISTS`, donc ne causera pas d'erreur si la table existe déjà
- La table est créée avec exactement le même schéma que dans Prisma

## Alternative : Exécution directe sur la base de données

Si le problème persiste, vous pouvez également exécuter ces requêtes SQL directement sur votre base de données de production :

### 1. Créer la table verification
```sql
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);
```

### 2. Ajouter les colonnes manquantes à la table accounts
```sql
-- Ajouter toutes les colonnes manquantes
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "idToken" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "sessionState" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "tokenType" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "accountId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "providerId" TEXT NOT NULL DEFAULT '';
```

## Prévention future

Pour éviter ce problème à l'avenir :

1. Toujours tester les migrations en staging avant la production
2. Utiliser `prisma migrate deploy` au lieu de `prisma db push` en production
3. Vérifier les logs de déploiement Vercel pour s'assurer que les migrations réussissent
4. Garder le script `ensure-verification-table.js` dans le processus de build
