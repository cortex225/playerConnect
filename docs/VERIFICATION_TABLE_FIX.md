# Correctif pour l'erreur "Table verification does not exist"

## Problème

En production sur Vercel, l'erreur suivante se produit lors de la connexion :

```
Invalid `prisma.verification.create()` invocation:
The table `public.verification` does not exist in the current database.
```

## Cause

Cette erreur se produit lorsque les migrations Prisma ne sont pas exécutées correctement lors du déploiement sur Vercel, ou si la table `verification` a été supprimée accidentellement de la base de données de production.

## Solution

Nous avons mis en place un script de vérification idempotent qui s'assure que la table `verification` existe toujours avant chaque build.

### Fichiers modifiés

1. **scripts/ensure-verification-table.js** (nouveau)
   - Script Node.js qui crée la table `verification` si elle n'existe pas
   - Utilise `CREATE TABLE IF NOT EXISTS` pour être idempotent
   - Vérifie l'existence de la table après création

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

Si le problème persiste, vous pouvez également exécuter cette requête SQL directement sur votre base de données de production :

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

## Prévention future

Pour éviter ce problème à l'avenir :

1. Toujours tester les migrations en staging avant la production
2. Utiliser `prisma migrate deploy` au lieu de `prisma db push` en production
3. Vérifier les logs de déploiement Vercel pour s'assurer que les migrations réussissent
4. Garder le script `ensure-verification-table.js` dans le processus de build
