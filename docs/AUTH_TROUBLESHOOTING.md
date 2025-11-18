# 🔧 Guide de dépannage - Authentification Better Auth

## 🔴 Erreur: "internal_server_error" lors de la connexion

### Symptômes
- Message d'erreur: "Better Auth Error - We encountered an issue while processing your request"
- Code d'erreur: `internal_server_error`
- L'utilisateur ne peut pas se connecter via OAuth (Google) ou email/password

### Causes possibles

#### 1. **Colonnes OAuth manquantes dans la base de données** ⚠️ (Cause principale)

La table `accounts` doit contenir les colonnes suivantes pour OAuth:
- `accountId` (TEXT NOT NULL) - Identifiant du compte OAuth
- `providerId` (TEXT NOT NULL) - Identifiant du provider (ex: "google")
- Contrainte unique: `[providerId, accountId]`

**Diagnostic:**
```sql
-- Vérifier si les colonnes existent
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name='accounts'
  AND column_name IN ('accountId', 'providerId')
ORDER BY column_name;
```

**Solution:**
```bash
# 1. Exécuter les migrations Prisma
pnpm db:migrate

# 2. Exécuter le script de vérification
pnpm db:ensure-verification

# 3. Redémarrer l'application
```

#### 2. **Variables d'environnement manquantes**

**Variables requises:**
```bash
DATABASE_URL="postgresql://..."           # Connexion à la base
BETTER_AUTH_SECRET="..."                  # Secret de session (32+ caractères)
NEXT_PUBLIC_APP_URL="https://..."         # URL publique
GOOGLE_CLIENT_ID="..."                    # OAuth Google
GOOGLE_CLIENT_SECRET="..."                # OAuth Google
```

**Diagnostic:**
```bash
# Vérifier que toutes les variables sont définies
node -e "console.log({
  DATABASE_URL: process.env.DATABASE_URL ? '✅' : '❌',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✅' : '❌',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? '✅' : '❌',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅' : '❌',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅' : '❌'
})"
```

**Solution:**
1. Copier `.env.example` vers `.env.local`
2. Remplir toutes les variables requises
3. Redémarrer l'application

#### 3. **Migrations Prisma non appliquées**

**Diagnostic:**
```bash
# Vérifier le statut des migrations
pnpm db:verify
```

**Solution:**
```bash
# Appliquer les migrations
pnpm db:migrate

# Si erreur, vérifier les logs et corriger
# Puis réessayer
```

#### 4. **Mauvaise configuration OAuth Google**

**Vérifications:**
- ✅ Projet Google Cloud créé
- ✅ API Google+ ou People API activée
- ✅ Identifiants OAuth 2.0 créés
- ✅ URIs de redirection autorisées configurées:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://votre-domaine.com/api/auth/callback/google` (prod)

**Solution:**
1. Aller sur https://console.cloud.google.com/apis/credentials
2. Vérifier/corriger les URIs de redirection
3. Vérifier que les clés correspondent à `.env`

#### 5. **Problème de base de données**

**Diagnostic:**
```bash
# Tester la connexion
npx prisma db pull

# Vérifier le schéma
npx prisma db status
```

**Solution:**
- Vérifier que DATABASE_URL est correct
- Vérifier que la base de données est accessible
- Vérifier les permissions de l'utilisateur DB

---

## 📊 Logs de débogage

### Activer les logs détaillés

Les logs sont maintenant automatiquement activés dans `/app/api/auth/[...all]/route.ts`.

**En développement**, vous verrez:
```
[Auth API] POST https://localhost:3000/api/auth/sign-in/email
[Auth API] POST failed with status 500: { error: "..." }
```

**En production**, consultez les logs de votre plateforme:
- **Vercel**: Dashboard > Deployments > Runtime Logs
- **Heroku**: `heroku logs --tail`
- **Docker**: `docker logs -f container-name`

### Logs à surveiller

```bash
# ✅ Bon signe
[Auth API] POST https://...
# Réponse HTTP 200 ou 302

# ❌ Problème
[Auth API] POST error: { error: "...", stack: "..." }
# Erreur avec stack trace détaillée
```

---

## 🚀 Checklist de déploiement

Avant de déployer en production:

### 1. Base de données
- [ ] Variable `DATABASE_URL` configurée
- [ ] Migrations appliquées (`pnpm db:migrate`)
- [ ] Script de vérification exécuté (`pnpm db:ensure-verification`)
- [ ] Colonnes `accountId` et `providerId` présentes

### 2. Variables d'environnement
- [ ] `BETTER_AUTH_SECRET` généré (32+ caractères)
- [ ] `NEXT_PUBLIC_APP_URL` correspond à l'URL de production
- [ ] `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` configurés
- [ ] Autres variables optionnelles selon besoins

### 3. OAuth Google
- [ ] URIs de redirection ajoutées pour le domaine de production
- [ ] Application vérifiée (si nécessaire pour sortir du mode test)

### 4. Tests
- [ ] Connexion via email/password fonctionne
- [ ] Connexion via Google fonctionne
- [ ] Sessions persistent correctement
- [ ] Déconnexion fonctionne

---

## 🔍 Commandes utiles

```bash
# Vérifier le schéma de la base de données
pnpm db:verify

# Appliquer les migrations
pnpm db:migrate

# Exécuter le script de vérification/réparation
pnpm db:ensure-verification

# Ouvrir Prisma Studio (interface graphique)
pnpm db:studio

# Régénérer le client Prisma
pnpm prisma generate

# Créer une nouvelle migration
pnpm prisma migrate dev --name description_migration
```

---

## 🆘 Support

### Logs d'erreur importants

Si vous rencontrez toujours des problèmes, collectez ces informations:

1. **Logs de l'application** (dernières 50 lignes)
2. **Résultat de `pnpm db:ensure-verification`**
3. **Variables d'environnement** (masquez les secrets!)
4. **Message d'erreur exact** vu par l'utilisateur
5. **URL de callback OAuth** utilisée

### Problèmes connus

#### Migration 20250325191358 et 20250325192432
Ces migrations ont un historique problématique:
- La première **supprime** `accountId` et `providerId`
- La seconde essaie de les **rajouter** avec `NOT NULL`

**Solution:** La migration `20251118000000_fix_account_oauth_columns` corrige ce problème de manière idempotente.

#### Script ensure-verification-table.js
Le script a été amélioré pour:
- Vérifier l'existence des colonnes avant d'agir
- Mettre à jour les enregistrements existants avant d'ajouter NOT NULL
- Fournir des logs détaillés sur l'état du schéma

---

## 📚 Ressources

- [Better Auth Documentation](https://better-auth.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
