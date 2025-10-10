# Bonnes Pratiques pour les Migrations de Base de Données

## ⚠️ Problème Résolu

L'erreur suivante était causée par une table `verification` manquante en production :

```
ERROR [Better Auth]:
Invalid `prisma.verification.create()` invocation:
The table `public.verification` does not exist in the current database.
```

### Cause Racine

1. Migration `20250325183157_remove_verification_table` a supprimé la table `verification`
2. Migration `20250508032252_fix_verification_model` essayait de modifier une table qui n'existait plus
3. L'ordre des migrations a créé une incohérence entre le schéma Prisma et la base de données en production

## 🎯 Règles d'Or pour les Migrations

### 1. **JAMAIS modifier une migration après son déploiement**

❌ **Mauvais :**
```bash
# Modifier une migration déjà appliquée en production
git commit -m "fix migration"
```

✅ **Bon :**
```bash
# Créer une nouvelle migration pour corriger
npx prisma migrate dev --name fix_verification_table
```

### 2. **Toujours utiliser des migrations idempotentes pour les corrections**

✅ **Bon :**
```sql
-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT NOT NULL,
    -- ...
);

-- Ajouter une colonne si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='new_field') THEN
        ALTER TABLE "users" ADD COLUMN "new_field" TEXT;
    END IF;
END $$;
```

### 3. **Workflow de Migration Standard**

```bash
# 1. Développement local
npx prisma migrate dev --name descriptive_name

# 2. Vérifier l'état des migrations
pnpm db:verify

# 3. Tester localement
pnpm dev

# 4. Commit ET push
git add prisma/migrations/
git commit -m "feat(db): descriptive migration name"
git push

# 5. En production (automatique via package.json)
pnpm build  # Exécute automatiquement prisma migrate deploy
```

### 4. **Scripts NPM Disponibles**

```json
{
  "db:migrate": "prisma migrate deploy",     // Déployer les migrations
  "db:verify": "prisma migrate status",      // Vérifier l'état
  "db:push": "prisma db push",               // Push schema (dev only)
  "db:studio": "prisma studio"               // Interface graphique
}
```

### 5. **Checklist avant Déploiement**

- [ ] Vérifier que toutes les migrations sont appliquées localement
- [ ] Tester l'application en local avec les nouvelles migrations
- [ ] Vérifier que `prisma migrate status` ne montre aucun problème
- [ ] S'assurer que le schéma Prisma correspond aux migrations
- [ ] Tester les fonctionnalités affectées (ex: authentification)

### 6. **En cas de Problème en Production**

```bash
# 1. Vérifier l'état des migrations
pnpm db:verify

# 2. Si des migrations sont en attente
pnpm db:migrate

# 3. Si une table manque, créer une migration de correction
npx prisma migrate dev --name ensure_missing_table --create-only
# Éditer la migration avec CREATE TABLE IF NOT EXISTS
pnpm db:migrate
```

### 7. **Structure Recommandée pour Better Auth**

Le schéma Prisma doit toujours inclure ces tables pour Better Auth :

```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified Boolean   @default(false)
  password      String?
  // ...
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  user      User     @relation(...)
}

model Account {
  id           String @id @default(cuid())
  userId       String
  providerId   String
  accountId    String
  // ...
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### 8. **Éviter les Cycles de Suppression/Re-création**

❌ **Mauvais :**
```
Migration 1: CREATE TABLE verification
Migration 2: DROP TABLE verification
Migration 3: CREATE TABLE verification  // ← Problème !
Migration 4: ALTER TABLE verification   // ← La table peut ne pas exister !
```

✅ **Bon :**
```
Migration 1: CREATE TABLE verification
Migration 2: ALTER TABLE verification ADD COLUMN ...
Migration 3: ALTER TABLE verification MODIFY ...
```

## 🚀 Migration Corrective Appliquée

Fichier: `prisma/migrations/20251010000000_ensure_verification_table/migration.sql`

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

Cette migration :
- ✅ Est idempotente (peut être exécutée plusieurs fois)
- ✅ Ne cause pas d'erreur si la table existe déjà
- ✅ Corrige le problème en production

## 📚 Ressources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Better Auth Database Schema](https://better-auth.com/docs/concepts/database)
- [PostgreSQL IF NOT EXISTS](https://www.postgresql.org/docs/current/sql-createtable.html)

## 🔄 Prochaines Étapes

1. Déployer la migration corrective en production
2. Monitorer les logs pour s'assurer que l'erreur ne se reproduit plus
3. Suivre ces bonnes pratiques pour toutes les futures migrations
