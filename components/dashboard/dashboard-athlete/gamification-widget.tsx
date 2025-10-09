"use client";

import { useEffect, useState } from "react";
import { Award, Lock, Sparkles, Star, Trophy, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  xpReward: number;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
}

interface GamificationWidgetProps {
  athleteId: number;
  level: number;
  xp: number;
}

export function GamificationWidget({
  athleteId,
  level,
  xp,
}: GamificationWidgetProps) {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculer l'XP nécessaire pour le niveau suivant
  const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 300 },
    { level: 4, xp: 600 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 1500 },
    { level: 7, xp: 2200 },
    { level: 8, xp: 3000 },
    { level: 9, xp: 4000 },
    { level: 10, xp: 5500 },
  ];

  const currentLevelThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level);
  const nextLevelThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level + 1);
  const xpForCurrentLevel = currentLevelThreshold?.xp || 0;
  const xpForNextLevel = nextLevelThreshold?.xp || 10000;
  const xpProgress = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpProgress / xpNeeded) * 100;

  useEffect(() => {
    fetchBadges();
  }, [athleteId]);

  async function fetchBadges() {
    setLoading(true);
    try {
      // TODO: Implémenter l'API réelle pour récupérer les badges
      // Pour l'instant, utiliser des données de test
      const mockBadges: BadgeData[] = [
        {
          id: "1",
          name: "Première Performance",
          description: "Ajoute ta première statistique de match",
          icon: "star",
          type: "MILESTONE",
          rarity: "COMMON",
          xpReward: 50,
          earned: true,
          earnedAt: new Date(),
        },
        {
          id: "2",
          name: "Joueur Régulier",
          description: "Ajoute des stats 4 semaines consécutives",
          icon: "trophy",
          type: "CONSISTENCY",
          rarity: "RARE",
          xpReward: 100,
          earned: false,
          progress: 60,
        },
        {
          id: "3",
          name: "Top Performer",
          description: "Obtiens un score de performance supérieur à 90",
          icon: "award",
          type: "PERFORMANCE",
          rarity: "EPIC",
          xpReward: 200,
          earned: false,
          progress: 75,
        },
        {
          id: "4",
          name: "Légende",
          description: "Atteins le top 10 du classement national",
          icon: "zap",
          type: "ACHIEVEMENT",
          rarity: "LEGENDARY",
          xpReward: 500,
          earned: false,
          progress: 20,
        },
      ];

      setBadges(mockBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      COMMON: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      RARE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      EPIC: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      LEGENDARY: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };
    return colors[rarity as keyof typeof colors] || colors.COMMON;
  };

  const getBadgeIcon = (icon: string, rarity: string) => {
    const iconMap: Record<string, any> = {
      star: Star,
      trophy: Trophy,
      award: Award,
      zap: Zap,
    };

    const IconComponent = iconMap[icon] || Award;
    const colorMap = {
      COMMON: "text-gray-500",
      RARE: "text-blue-500",
      EPIC: "text-purple-500",
      LEGENDARY: "text-yellow-500",
    };

    return (
      <IconComponent
        className={cn("size-6", colorMap[rarity as keyof typeof colorMap])}
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const availableBadges = badges.filter((b) => !b.earned);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600/10 to-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <CardTitle>Progression & Récompenses</CardTitle>
        </div>
        <CardDescription>
          Débloque des badges et monte de niveau
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-lg font-bold text-white">
                {level}
              </div>
              <div>
                <div className="text-sm font-medium">Niveau {level}</div>
                <div className="text-xs text-muted-foreground">
                  {xpProgress} / {xpNeeded} XP
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="size-3" />
              {xp} XP
            </Badge>
          </div>

          <div className="space-y-1">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {xpNeeded - xpProgress} XP pour atteindre le niveau {level + 1}
            </p>
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Badges Débloqués</h4>
            <div className="grid grid-cols-3 gap-3">
              <TooltipProvider>
                {earnedBadges.map((badge) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:scale-105",
                          getRarityColor(badge.rarity)
                        )}
                      >
                        {getBadgeIcon(badge.icon, badge.rarity)}
                        <span className="text-center text-xs font-medium">
                          {badge.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs space-y-1">
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                        <p className="text-xs text-primary">+{badge.xpReward} XP</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Available Badges */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Badges à Débloquer</h4>
          <div className="space-y-3">
            <TooltipProvider>
              {availableBadges.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
                        getRarityColor(badge.rarity)
                      )}
                    >
                      <div className="relative">
                        {getBadgeIcon(badge.icon, badge.rarity)}
                        {!badge.earned && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                            <Lock className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{badge.name}</span>
                          <Badge variant="outline" className="text-xs">
                            +{badge.xpReward} XP
                          </Badge>
                        </div>
                        {badge.progress !== undefined && (
                          <div className="space-y-1">
                            <Progress value={badge.progress} className="h-1" />
                            <p className="text-xs text-muted-foreground">
                              {badge.progress}% complété
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs space-y-1">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* XP Tips */}
        <div className="rounded-lg bg-gradient-to-br from-primary/5 to-purple-600/5 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-primary" />
            Gagne de l'XP en :
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Ajoutant des performances (+50 XP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Téléchargeant des médias (+25 XP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Débloquant des badges (jusqu'à +500 XP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Te connectant chaque jour (+10 XP)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
