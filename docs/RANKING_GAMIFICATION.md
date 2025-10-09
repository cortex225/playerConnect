# Système de Ranking et Gamification - PlayerConnect

## Vue d'ensemble

Ce document décrit le système de ranking et de gamification implémenté dans PlayerConnect pour motiver les athlètes à améliorer leurs performances et à rester engagés sur la plateforme.

## Architecture

### 1. Schéma de Base de Données

#### Nouveaux modèles ajoutés :

**Athlete (mise à jour)**
- `country`: Pays de l'athlète (pour ranking national)
- `region`: Région de l'athlète (pour ranking régional)
- `totalScore`: Score total calculé basé sur les performances
- `level`: Niveau de gamification (1-20)
- `xp`: Points d'expérience accumulés

**Ranking**
- Stocke les positions au classement pour différents scopes (Global, National, Régional, Local)
- Permet de filtrer par sport, position, période
- Index optimisés pour les requêtes de classement

**Badge**
- Définit les badges disponibles avec leurs conditions
- Types : PERFORMANCE, MILESTONE, CONSISTENCY, ACHIEVEMENT, SPECIAL
- Raretés : COMMON, RARE, EPIC, LEGENDARY

**AthleteBadge**
- Table de liaison entre athlètes et badges
- Stocke la date d'obtention du badge

### 2. Algorithme de Ranking

#### Calcul du Score de Performance

Le score de performance est calculé en fonction de statistiques pondérées selon le sport et la position :

```typescript
Score = Σ(stat.value × weight × 100) / Σ(weights)
```

**Exemple pour Basketball - Guard:**
- Points: 35%
- Passes décisives: 30%
- Interceptions: 20%
- Rebonds: 10%
- Contres: 5%

**Bonus de Régularité:**
- +2 points par performance (max 50 points)
- Encourage la constance et l'engagement

#### Scopes de Ranking

1. **GLOBAL**: Classement mondial
2. **NATIONAL**: Classement par pays
3. **REGIONAL**: Classement par région
4. **LOCAL**: Classement par ville

### 3. Système de Gamification

#### Niveaux et XP

**Structure des niveaux (1-20):**
- Niveau 1: 0 XP
- Niveau 2: 100 XP
- Niveau 3: 300 XP
- Niveau 4: 600 XP
- Niveau 5: 1000 XP
- ...
- Niveau 20: 70000 XP

**Récompenses XP:**
- Ajouter une performance: +50 XP
- Télécharger un média: +25 XP
- Profil complété: +100 XP
- Match complété: +75 XP
- Badge obtenu: +150 XP (variable selon le badge)
- Connexion quotidienne: +10 XP
- Régularité hebdomadaire: +200 XP

#### Badges

**Types de badges:**

1. **MILESTONE** - Jalons
   - Première performance
   - 10, 50, 100 performances

2. **PERFORMANCE** - Performances exceptionnelles
   - Score > 90
   - Score parfait (100)

3. **CONSISTENCY** - Régularité
   - 4 semaines consécutives
   - Connexion quotidienne 7 jours
   - 8+ performances par mois

4. **ACHIEVEMENT** - Accomplissements
   - Top 10 régional/national
   - Progression rapide au classement

5. **SPECIAL** - Spéciaux
   - Profil complet
   - 10+ médias
   - Early adopter

## API Endpoints

### GET `/api/rankings/top-athletes`

Récupère les meilleurs athlètes filtrés par sport, région, pays.

**Paramètres:**
- `sport` (optionnel): Type de sport (BASKETBALL, FOOTBALL, etc.)
- `limit` (optionnel): Nombre de résultats (défaut: 10)
- `region` (optionnel): Filtrer par région
- `country` (optionnel): Filtrer par pays

**Réponse:**
```json
{
  "athletes": [
    {
      "id": 1,
      "rank": 1,
      "name": "John Doe",
      "sport": "BASKETBALL",
      "position": "Guard",
      "totalScore": 85.5,
      "level": 12,
      "xp": 15000,
      "averagePerformance": 87.3,
      "performancesCount": 42,
      "badges": [...]
    }
  ],
  "total": 10
}
```

### GET `/api/rankings`

Récupère les rankings détaillés avec filtres avancés.

**Paramètres:**
- `sport` (requis): Type de sport
- `scope` (optionnel): GLOBAL, NATIONAL, REGIONAL, LOCAL
- `period` (optionnel): all-time, year, quarter, month, week
- `region` (optionnel): Région
- `country` (optionnel): Pays
- `limit` (optionnel): Nombre de résultats

## Composants Frontend

### 1. TopPlayers (Landing Page)

Affiche les meilleurs athlètes sur la page d'accueil avec :
- Filtres par sport
- Badges de top 3 avec couleurs distinctives
- Statistiques clés (score, niveau, performances)
- Design responsive avec animations

**Emplacement:** `components/sections/top-players.tsx`

### 2. RankingWidget (Dashboard Athlète)

Widget personnel montrant :
- Classement dans différents scopes (onglets)
- Position actuelle et percentile
- Score de performance
- Conseils d'amélioration

**Emplacement:** `components/dashboard/dashboard-athlete/ranking-widget.tsx`

### 3. GamificationWidget (Dashboard Athlète)

Affiche la progression de gamification :
- Niveau actuel et barre de progression XP
- Badges débloqués (avec tooltips)
- Badges à débloquer avec progression
- Conseils pour gagner de l'XP

**Emplacement:** `components/dashboard/dashboard-athlete/gamification-widget.tsx`

## Utilitaires

### `lib/ranking.ts`

Fonctions principales :

1. **calculatePerformanceScore()**: Calcule le score d'une performance
2. **calculateAthleteScore()**: Calcule le score total d'un athlète
3. **updateRankings()**: Met à jour les classements
4. **calculateLevel()**: Calcule le niveau basé sur l'XP
5. **addXpToAthlete()**: Ajoute de l'XP et gère les montées de niveau
6. **checkAndAwardBadges()**: Vérifie et attribue les badges automatiquement

## Actions Serveur

### `createPerformanceWithGamification()`

Action complète qui :
1. Crée la performance avec statistiques
2. Calcule et sauvegarde le score
3. Ajoute l'XP (+50)
4. Met à jour le score total de l'athlète
5. Vérifie et attribue les badges automatiquement
6. Revalide le cache de la page

**Emplacement:** `actions/update-performance.ts`

## Migration et Initialisation

### 1. Migration Prisma

```bash
npx prisma migrate dev --name add-ranking-gamification
```

### 2. Seed des Badges

```bash
npx tsx prisma/migrations/seed-badges.ts
```

Initialise 15 badges par défaut couvrant tous les types.

## Intégration dans le Dashboard

Le dashboard athlète affiche maintenant :

1. **Ranking Widget** (col-span-3)
   - Vue du classement personnel
   - Navigation entre scopes

2. **Gamification Widget** (col-span-4)
   - Progression de niveau
   - Badges et XP

Ces widgets sont placés stratégiquement pour motiver l'athlète à :
- Améliorer ses statistiques
- Rester régulier
- Compléter son profil
- Viser les objectifs de badges

## Améliorations Futures

### Court terme
- [ ] Implémenter les API réelles pour les rankings
- [ ] Ajouter un cron job pour mettre à jour les rankings quotidiennement
- [ ] Notifier les athlètes quand ils gagnent/perdent des places
- [ ] Ajouter des leaderboards publics par sport

### Moyen terme
- [ ] Système de quêtes hebdomadaires
- [ ] Badges saisonniers et événementiels
- [ ] Comparaison avec des amis
- [ ] Historique de progression au classement

### Long terme
- [ ] Système de récompenses réelles (partenariats)
- [ ] Compétitions inter-régions
- [ ] Prédictions de progression IA
- [ ] Analytics avancées de performance

## Performance et Optimisation

### Index Base de Données
- `rankings`: Index sur `(sportId, scope, period, rank)`
- `rankings`: Index sur `(athleteId, sportId)`
- `athlete_badges`: Index unique sur `(athleteId, badgeId)`

### Cache
- Utiliser `revalidatePath()` pour invalider le cache après les mises à jour
- Envisager Redis pour les leaderboards en temps réel

### Scalabilité
- Les calculs de ranking peuvent être faits en arrière-plan
- Utiliser des jobs asynchrones pour les mises à jour massives
- Pagination sur les API de classement

## Tests

### Tests Unitaires
```typescript
// Tester le calcul de score
test('calculatePerformanceScore returns correct score', () => {
  const stats = [
    { key: 'points', value: 25 },
    { key: 'rebounds', value: 10 },
    { key: 'assists', value: 8 }
  ];
  const score = calculatePerformanceScore(stats, 'BASKETBALL', 'Guard');
  expect(score).toBeGreaterThan(0);
});
```

### Tests d'Intégration
- Vérifier que les badges sont attribués correctement
- Tester les mises à jour de ranking
- Valider les calculs de niveau et XP

## Support et Documentation

Pour toute question ou suggestion concernant le système de ranking et gamification :
- Consulter ce document
- Ouvrir une issue sur GitHub
- Contacter l'équipe technique

---

**Dernière mise à jour:** 2025-10-08
**Version:** 1.0.0
