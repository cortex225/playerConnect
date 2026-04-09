"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getTopAthletes } from "@/actions/get-athlete";
import {
  ArrowRight,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import { Athlete } from "@/types";
import { cn } from "@/lib/utils";
import { getSportIcon, getSportColor } from "@/lib/sport-icons";
import AthleteProfileDialog from "@/components/modals/athlete/athlete-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TopAthlete = Awaited<ReturnType<typeof getTopAthletes>>[number];

export const TopAthletes = () => {
  const [athletes, setAthletes] = useState<TopAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);

  const handleRetry = () => {
    setRetryCount(0);
    fetchAthletes();
  };

  const fetchAthletes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTopAthletes();
      setAthletes(data);
      setRetryCount(0);
    } catch (error) {
      console.error("Erreur lors de la recuperation des athletes:", error);

      if (retryCount < 3) {
        console.log(
          `Tentative de recuperation des athletes echouee (${retryCount + 1}/3), nouvelle tentative dans 1s...`,
        );
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 1000);
      } else {
        setError(
          "Impossible de charger les athletes. Veuillez reessayer plus tard.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [retryCount]);

  const rankedAthletes = athletes
    .sort((a, b) => {
      const aScore = a.performances?.[0]?.score ?? 0;
      const bScore = b.performances?.[0]?.score ?? 0;
      return bScore - aScore;
    })
    .map((athlete, index) => ({ ...athlete, rank: index + 1 }));

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "from-yellow-500 to-amber-500 text-white";
    if (rank === 2) return "from-gray-300 to-gray-400 text-white";
    if (rank === 3) return "from-orange-400 to-orange-500 text-white";
    return "from-muted to-muted text-muted-foreground";
  };

  const getTrend = (performances: any[]) => {
    if (!performances || performances.length < 2) return null;
    const diff = performances[0].score - performances[1].score;
    return diff;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm md:col-span-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />
            <CardTitle className="font-urban text-lg">
              Talents du moment
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border p-3"
              >
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <Skeleton className="size-11 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm md:col-span-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />
            <CardTitle className="font-urban text-lg">
              Talents du moment
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <p className="text-center text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={handleRetry}>
              Reessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (athletes.length === 0 && !loading) {
    return (
      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm md:col-span-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />
            <CardTitle className="font-urban text-lg">
              Talents du moment
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <p className="text-center text-muted-foreground">
              Aucun athlete avec des performances n&apos;a ete trouve.
            </p>
            <Button variant="outline" onClick={handleRetry}>
              Reessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm md:col-span-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />
            <CardTitle className="font-urban text-lg">
              Talents du moment
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1 text-primary"
          >
            <Link href="/dashboard/recruiter/athletes">
              Voir tout
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {rankedAthletes.map((athlete) => {
            const bestScore = athlete.performances?.[0]?.score;
            const trend = getTrend(athlete.performances);
            const matchCount =
              (athlete as any)._count?.performances ??
              athlete.performances?.length ??
              0;

            return (
              <div
                key={athlete.id}
                onClick={() => setSelectedAthlete(athlete)}
                className="group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all hover:border-primary/30 hover:bg-accent/50"
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r text-xs font-bold",
                    getRankStyle(athlete.rank),
                  )}
                >
                  {athlete.rank}
                </div>

                <Avatar className="size-11 shrink-0 border-2 border-primary/10">
                  <AvatarImage src={athlete.user?.image || ""} />
                  <AvatarFallback className="text-xs">
                    {athlete.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "A"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {athlete.user?.name || "Athlete"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    <Badge
                      variant="secondary"
                      className={cn("px-1.5 py-0 text-[10px]", getSportColor(athlete.sport?.name))}
                    >
                      {getSportIcon(athlete.sport?.name)} {athlete.sport?.name || "Sport"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {athlete.category?.name || ""}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {bestScore && (
                      <span className="flex items-center gap-0.5 font-semibold text-foreground">
                        <Star className="size-3 text-yellow-500" />
                        {bestScore.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Zap className="size-3" />
                      {matchCount} matchs
                    </span>
                    {trend !== null && (
                      <span
                        className={cn(
                          "flex items-center gap-0.5 font-medium",
                          trend >= 0 ? "text-green-600" : "text-red-500",
                        )}
                      >
                        <TrendingUp
                          className={cn(
                            "size-3",
                            trend < 0 && "rotate-180",
                          )}
                        />
                        {trend >= 0 ? "+" : ""}
                        {trend.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {selectedAthlete && (
        <AthleteProfileDialog
          athlete={selectedAthlete as unknown as Athlete}
          selectedAthlete={selectedAthlete}
          onClose={() => setSelectedAthlete(null)}
        />
      )}
    </Card>
  );
};
