# Système de Messagerie Sécurisée

## Vue d'ensemble

Le système de messagerie de Player Connect a été conçu avec la sécurité des mineurs comme priorité absolue. Il intègre plusieurs couches de protection pour assurer une communication sûre entre athlètes et recruteurs.

## Fonctionnalités de sécurité

### 1. Protection des mineurs

#### Détection automatique
- Le système détecte automatiquement si un utilisateur est mineur (< 18 ans) basé sur :
  - La date de naissance (si fournie)
  - L'âge déclaré dans le profil athlète

#### Système de contacts approuvés
- Les mineurs ne peuvent communiquer qu'avec des contacts approuvés par un parent/tuteur
- Chaque demande de contact nécessite une approbation explicite
- Les approbations peuvent avoir une date d'expiration (par défaut 1 an)

#### Contrôle parental
Les athlètes mineurs ont des champs supplémentaires :
- `parentalConsentRequired`: Indique si le consentement parental est requis
- `parentalConsentGiven`: Indique si le consentement a été donné
- `parentEmail`: Email du parent/tuteur pour les notifications

### 2. Modération automatique du contenu

#### Filtrage en temps réel
Le système filtre automatiquement :
- **Informations personnelles** :
  - Numéros de téléphone
  - Adresses email
  - Adresses physiques

- **Demandes de contact externe** :
  - Réseaux sociaux (WhatsApp, Snapchat, Instagram, etc.)
  - Demandes de partage de coordonnées

- **Propositions de rencontre inappropriées** :
  - Rencontres en personne sans supervision
  - Demandes de rendez-vous privés

#### Actions de modération
- **Blocage** : Messages contenant du contenu interdit ne sont pas envoyés
- **Signalement** : Messages suspects sont marqués pour révision manuelle
- **Nettoyage** : Informations sensibles sont automatiquement masquées

### 3. Historique de modération

Toutes les actions sont enregistrées dans `ModerationLog` :
```typescript
{
  messageId: string,
  userId: string,
  action: "FLAG" | "WARN" | "BLOCK" | "DELETE" | "APPROVE",
  reason: string,
  moderatedBy: string,
  metadata: JSON
}
```

## Architecture technique

### Modèles de base de données

#### Message (étendu)
```prisma
model Message {
  id          String   @id
  content     String
  senderId    String
  recipientId String
  isRead      Boolean

  // Sécurité
  isModerated Boolean  @default(false)
  isFlagged   Boolean  @default(false)
  flagReason  String?
}
```

#### ApprovedContact
```prisma
model ApprovedContact {
  id          String   @id
  userId      String   // Mineur
  contactId   String   // Recruteur
  approvedBy  String?  // Parent
  approvedAt  DateTime
  expiresAt   DateTime?
  isActive    Boolean
}
```

### API Endpoints

#### POST /api/messages
Envoie un nouveau message avec validation complète :
1. Vérification d'authentification
2. Vérification de la permission de communiquer
3. Modération du contenu
4. Nettoyage des informations sensibles
5. Notification en temps réel via Pusher

#### GET /api/messages?recipientId={id}
Récupère les messages d'une conversation :
- Filtre les messages flaggés
- Marque automatiquement comme lus
- Applique les contrôles de permission

#### GET /api/contacts
Liste les contacts disponibles :
- Pour les mineurs : uniquement les contacts approuvés
- Pour les adultes : tous les recruteurs/athlètes

#### POST /api/contacts
Demande l'approbation d'un nouveau contact (mineurs uniquement)

#### POST /api/contacts/approve?token={token}
Approuve ou refuse un contact (parents/tuteurs)

## Fonctions utilitaires de sécurité

### lib/moderation.ts

#### `moderateContent(content: string)`
Analyse le contenu pour détecter :
- Patterns bloqués (retourne `isBlocked: true`)
- Patterns suspects (retourne `isSuspicious: true`)

#### `isMinor(userId: string)`
Détermine si un utilisateur est mineur

#### `canCommunicate(userId: string, recipientId: string)`
Vérifie si deux utilisateurs peuvent communiquer :
- Vérifie si l'un est mineur
- Vérifie l'approbation du contact
- Vérifie l'expiration de l'approbation

#### `sanitizeContent(content: string)`
Masque les informations sensibles dans le texte

## Interface utilisateur

### SecureMessagerie Component

L'interface de messagerie intègre :

1. **Liste de contacts** :
   - Affichage des contacts approuvés (pour mineurs)
   - Badge "Approuvé" pour les contacts validés
   - Informations sur l'organisation (recruteurs)

2. **Zone de conversation** :
   - Alerte de sécurité permanente
   - Messages en temps réel
   - Indicateur de lecture

3. **Envoi de messages** :
   - Validation côté client
   - Gestion des erreurs de modération
   - Feedback immédiat si contenu bloqué

## Notifications

Le système utilise Pusher pour les notifications en temps réel :

```typescript
// Nouveau message
pusherServer.trigger(
  `private-user-${recipientId}`,
  "new-message",
  messageData
);

// Notification
pusherServer.trigger(
  `private-user-${recipientId}`,
  "notification",
  {
    type: "new-message",
    from: senderName,
    message: "Nouveau message de ..."
  }
);
```

## Workflow d'approbation de contact

### Pour un mineur souhaitant contacter un recruteur :

1. **Demande initiale**
   ```
   Mineur → Sélectionne recruteur → Demande approbation
   ```

2. **Notification parent**
   ```
   Système → Envoie email au parent avec lien d'approbation
   ```

3. **Approbation**
   ```
   Parent → Clique lien → Approuve/Refuse
   ```

4. **Activation**
   ```
   Système → Active le contact dans ApprovedContact
   Mineur → Peut maintenant envoyer des messages
   ```

## Recommandations pour le déploiement

### 1. Configuration email
Intégrer Resend pour envoyer les emails d'approbation :
```typescript
// À ajouter dans /api/contacts
await resend.emails.send({
  from: "noreply@playerconnect.com",
  to: parentEmail,
  subject: "Demande d'approbation de contact",
  html: approvalEmailTemplate
});
```

### 2. Dashboard administrateur
Créer une interface pour :
- Réviser les messages flaggés
- Gérer les approbations manuellement
- Voir les logs de modération

### 3. Amélioration de la modération
- Intégrer une API de modération externe (OpenAI Moderation, Perspective API)
- Ajouter machine learning pour améliorer la détection
- Permettre aux utilisateurs de signaler des messages

### 4. Tests de sécurité
Tester régulièrement :
- Contournement des filtres
- Faux positifs/négatifs
- Performance de la modération

## Conformité légale

Le système aide à respecter :
- **COPPA** (Children's Online Privacy Protection Act) - États-Unis
- **GDPR** - Protection des données en Europe
- **Loi sur la protection de la jeunesse** - Diverses juridictions

### Points clés :
- ✅ Consentement parental pour mineurs
- ✅ Limitation des communications
- ✅ Surveillance et modération
- ✅ Traçabilité des actions
- ✅ Droit à l'oubli (via cascade delete)

## Maintenance

### Mise à jour des patterns de modération
Éditer `lib/moderation.ts` :
```typescript
const BLOCKED_PATTERNS = [
  // Ajouter de nouveaux patterns ici
];
```

### Vérification des logs
```sql
-- Messages suspects récents
SELECT * FROM moderation_logs
WHERE action = 'FLAG'
ORDER BY createdAt DESC
LIMIT 50;

-- Utilisateurs avec le plus de messages bloqués
SELECT userId, COUNT(*) as blocked_count
FROM moderation_logs
WHERE action = 'BLOCK'
GROUP BY userId
ORDER BY blocked_count DESC;
```

## Support

Pour toute question ou signalement de sécurité :
- Email : security@playerconnect.com
- Documentation : /docs/security
