# 🚀 Guide de Déploiement Production - PlayerConnect

## ❌ Problème Actuel

Erreur de build Vercel :
```
Error: Schema engine error:
FATAL: Tenant or user not found
```

**Cause :** Les variables d'environnement nécessaires ne sont pas configurées sur Vercel.

---

## ✅ Solution : Configuration Vercel

### 1️⃣ Accéder aux Variables d'Environnement

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **playerConnect**
3. Allez dans **Settings** → **Environment Variables**

### 2️⃣ Variables OBLIGATOIRES à Configurer

#### 🔐 Base de Données (Supabase)

Allez sur [Supabase Dashboard](https://supabase.com/dashboard) → Votre Projet → Settings → Database

```bash
# URL avec connection pooling (pour les requêtes)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# URL directe (pour les migrations)
DIRECT_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

**⚠️ IMPORTANT :**
- `DATABASE_URL` doit contenir `?pgbouncer=true` pour le pooling
- `DIRECT_URL` ne doit PAS contenir `?pgbouncer=true`
- Remplacez `[YOUR-PASSWORD]` par votre vrai mot de passe Supabase

**Où trouver ces URLs :**
1. Supabase Dashboard → Project Settings → Database
2. Copiez **Connection string** → **Session pooling** pour `DATABASE_URL`
3. Copiez **Connection string** → **Direct connection** pour `DIRECT_URL`

#### 🔑 Better Auth (Authentification)

```bash
# Générez un secret fort avec cette commande : openssl rand -base64 32
BETTER_AUTH_SECRET="<votre-secret-32-caracteres-minimum>"

# URL de votre application en production
NEXT_PUBLIC_APP_URL="https://votre-domaine.vercel.app"
```

**Pour générer un BETTER_AUTH_SECRET sécurisé :**
```bash
# Sur Linux/Mac/Git Bash :
openssl rand -base64 32

# Ou utilisez : https://generate-secret.vercel.app/32
```

#### 🔵 Google OAuth (Connexion Google)

Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

```bash
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

**Configuration Google OAuth :**

1. **Créer un projet Google Cloud** (si pas déjà fait)
   - Allez sur https://console.cloud.google.com
   - Créez un nouveau projet ou sélectionnez-en un

2. **Activer Google+ API**
   - APIs & Services → Library
   - Cherchez "Google+ API" et activez-la

3. **Créer des identifiants OAuth 2.0**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: **Web application**

4. **Configurer les URIs de redirection autorisées**
   ```
   https://votre-domaine.vercel.app/api/auth/callback/google
   ```

5. **Copier les identifiants**
   - Copiez Client ID → `GOOGLE_CLIENT_ID`
   - Copiez Client secret → `GOOGLE_CLIENT_SECRET`

---

### 3️⃣ Ajouter les Variables sur Vercel

**Via l'interface Vercel :**

1. Settings → Environment Variables
2. Pour chaque variable :
   - **Key** : `DATABASE_URL`
   - **Value** : `postgresql://postgres...`
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
3. Cliquez **Save**

**Ou via la CLI Vercel :**

```bash
# Installez Vercel CLI si nécessaire
npm i -g vercel

# Connectez-vous
vercel login

# Ajoutez les variables
vercel env add DATABASE_URL production
# Collez la valeur quand demandé

vercel env add DIRECT_URL production
vercel env add BETTER_AUTH_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

---

### 4️⃣ Redéployer

Après avoir configuré toutes les variables :

```bash
# Option 1 : Via l'interface Vercel
# → Deployments → Dernière build → ⋯ → Redeploy

# Option 2 : Push un nouveau commit
git commit --allow-empty -m "chore: trigger redeploy"
git push origin claude/debug-better-auth-prod-01KmBdHAJq9DpKbHPQa3wNLU
```

---

## 📋 Checklist de Déploiement

Avant de déployer, vérifiez que vous avez configuré :

### Variables OBLIGATOIRES :
- [ ] `DATABASE_URL` (avec `?pgbouncer=true`)
- [ ] `DIRECT_URL` (sans `?pgbouncer=true`)
- [ ] `BETTER_AUTH_SECRET` (32+ caractères)
- [ ] `NEXT_PUBLIC_APP_URL` (https://votre-domaine.vercel.app)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

### Configuration Google OAuth :
- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth credentials créés
- [ ] Redirect URI configurée : `https://votre-domaine.vercel.app/api/auth/callback/google`

### Base de données :
- [ ] Projet Supabase créé
- [ ] Connection pooling activé
- [ ] Migrations Prisma exécutées en local avec succès

---

## 🔍 Vérification Post-Déploiement

Une fois déployé, vérifiez :

1. **Build réussi** : Vercel → Deployments → Status ✅

2. **Base de données connectée** :
   ```
   ✔ Generated Prisma Client
   Migrations applied successfully
   ```

3. **Variables d'environnement** :
   - Settings → Environment Variables
   - Vérifiez que toutes les variables sont présentes

4. **Connexion fonctionne** :
   - Visitez `https://votre-domaine.vercel.app`
   - Testez la connexion Google OAuth
   - Testez la connexion email/password

---

## 🐛 Dépannage

### Erreur : "Tenant or user not found"
**Cause :** Credentials Supabase incorrects ou DATABASE_URL mal configurée

**Solution :**
1. Vérifiez votre mot de passe Supabase
2. Régénérez le mot de passe sur Supabase Dashboard → Settings → Database → Reset database password
3. Mettez à jour DATABASE_URL et DIRECT_URL sur Vercel
4. Redéployez

### Erreur : "BETTER_AUTH_SECRET must be set in production"
**Cause :** Variable BETTER_AUTH_SECRET manquante ou trop courte

**Solution :**
1. Générez un secret : `openssl rand -base64 32`
2. Ajoutez-le sur Vercel : Settings → Environment Variables
3. Redéployez

### Erreur : "NEXT_PUBLIC_APP_URL must be set in production"
**Cause :** Variable NEXT_PUBLIC_APP_URL manquante

**Solution :**
1. Trouvez votre URL Vercel : `https://votre-projet.vercel.app`
2. Ajoutez `NEXT_PUBLIC_APP_URL=https://votre-projet.vercel.app` sur Vercel
3. Redéployez

### Google OAuth ne fonctionne pas
**Cause :** Redirect URI non configurée

**Solution :**
1. Google Cloud Console → Credentials → Votre OAuth client
2. Authorized redirect URIs → Add URI
3. Ajoutez : `https://votre-domaine.vercel.app/api/auth/callback/google`
4. Save

---

## 📚 Ressources

- [Documentation Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Documentation Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel : Deployments → Votre build → Build Logs
2. Vérifiez les logs runtime : Deployments → Votre build → Function Logs
3. Contactez le support Vercel ou ouvrez une issue GitHub
