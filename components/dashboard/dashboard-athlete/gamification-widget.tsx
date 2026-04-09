"use client";

import { useEffect, useState } from "react";
import { Award, Crown, Eye, Flame, Lock, Sparkles, Star, TrendingUp, Trophy, Video, Zap, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  rarity: string;
  xpReward: number;
  earned: boolean;
  progress: number;
}

interface GamificationData {
  badges: BadgeData[];
  stats: {
    earned: number;
    total: number;
    totalXp: number;
    performanceCount: number;
    bestScore: number;
    mediaCount: number;
    level: number;
  };
}

interface GamificationWidgetProps {
  athleteId: number;
  level: number;
  xp: number;
}

const ICON_MAP: Record<string, any> = {
  star: Star,
  trophy: Trophy,
  award: Award,
  zap: Zap,
  flame: Flame,
  video: Video,
  sparkles: Sparkles,
  crown: Crown,
  eye: Eye,
  users: Users,
  calendar: Calendar,
  "trending-up": TrendingUp,
};

const RARITY_STYLES: Record<string, string> = {
  COMMON: "from-gray-400 to-gray-500",
  RARE: "from-blue-400 to-blue-600",
  EPIC: "from-purple-400 to-purple-600",
  LEGENDARY: "from-yellow-400 to-amber-500",
};

const RARITY_BG: Record<string, string> = {
  COMMON: "bg-gray-500/10 border-gray-500/20",
  RARE: "bg-blue-500/10 border-blue-500/20",
  EPIC: "bg-purple-500/10 border-purple-500/20",
  LEGENDARY: "bg-yellow-500/10 border-yellow-500/20",
};

export function GamificationWidget({ athleteId, level, xp }: GamificationWidgetProps) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gamification/badges")
      .then((res) => res.ok ? res.json() : null)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [athleteId]);

  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-600/10 to-primary/10 pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const earned = data.badges.filter((b) => b.earned);
  const nextToEarn = data.badges
    .filter((b) => !b.earned && b.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-600/10 to-primary/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="font-urban text-base">Tes Trophees</CardTitle>
          </div>
          <Badge variant="secondary" className="gap-1 text-xs">
            {data.stats.earned}/{data.stats.total}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Earned badges grid */}
        {earned.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {earned.map((badge) => {
              const IconComp = ICON_MAP[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border p-2 transition-all hover:scale-105",
                    RARITY_BG[badge.rarity]
                  )}
                  title={`${badge.name} - ${badge.description}`}
                >
                  <div className={cn("flex size-9 items-center justify-center rounded-full bg-gradient-to-r text-white", RARITY_STYLES[badge.rarity])}>
                    <IconComp className="size-4" />
                  </div>
                  <span className="line-clamp-1 text-center text-[9px] font-medium leading-tight">
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {earned.length === 0 && (
          <div className="rounded-2xl bg-muted/30 p-4 text-center">
            <Trophy className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Commence a jouer pour debloquer des trophees!
            </p>
          </div>
        )}

        {/* Next to earn - progress cards */}
        {nextToEarn.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prochain objectif
            </h4>
            {nextToEarn.map((badge) => {
              const IconComp = ICON_MAP[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <div className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r text-white opacity-50",
                    RARITY_STYLES[badge.rarity]
                  )}>
                    <IconComp className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs font-medium">{badge.name}</span>
                      <span className="shrink-0 text-[10px] text-primary">+{badge.xpReward} XP</span>
                    </div>
                    <Progress value={badge.progress} className="mt-1 h-1" />
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {badge.description} ({badge.progress}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
