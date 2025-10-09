"use client";

import { useEffect, useState } from "react";
import { Award, ChevronUp, MapPin, TrendingUp, Trophy } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RankingData {
  rank: number;
  score: number;
  scope: string;
  region?: string;
  country?: string;
  totalAthletes: number;
  percentile: number;
}

interface RankingWidgetProps {
  athleteId: number;
  sportId: string;
}

export function RankingWidget({ athleteId, sportId }: RankingWidgetProps) {
  const [rankings, setRankings] = useState<Record<string, RankingData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState("REGIONAL");

  useEffect(() => {
    fetchRankings();
  }, [athleteId, sportId]);

  async function fetchRankings() {
    setLoading(true);
    try {
      // Dans un cas réel, cette API retournerait tous les rankings de l'athlète
      const scopes = ["GLOBAL", "NATIONAL", "REGIONAL"];
      const rankingData: Record<string, RankingData> = {};

      for (const scope of scopes) {
        // Simuler une requête API
        // TODO: Implémenter l'API réelle
        rankingData[scope] = {
          rank: Math.floor(Math.random() * 1000) + 1,
          score: Math.random() * 100,
          scope,
          totalAthletes: Math.floor(Math.random() * 10000) + 1000,
          percentile: Math.random() * 100,
        };
      }

      setRankings(rankingData);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-500";
    if (rank <= 10) return "text-primary";
    return "text-muted-foreground";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={cn("size-6", getRankColor(rank))} />;
    }
    return <TrendingUp className="size-6 text-primary" />;
  };

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      GLOBAL: "Mondial",
      NATIONAL: "National",
      REGIONAL: "Régional",
      LOCAL: "Local",
    };
    return labels[scope] || scope;
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

  const currentRanking = rankings[selectedScope];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-600/10">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-primary" />
          <CardTitle>Ton Classement</CardTitle>
        </div>
        <CardDescription>
          Ton positionnement parmi les meilleurs athlètes
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs value={selectedScope} onValueChange={setSelectedScope}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="REGIONAL">Régional</TabsTrigger>
            <TabsTrigger value="NATIONAL">National</TabsTrigger>
            <TabsTrigger value="GLOBAL">Mondial</TabsTrigger>
          </TabsList>

          {Object.entries(rankings).map(([scope, data]) => (
            <TabsContent key={scope} value={scope} className="mt-6 space-y-6">
              {/* Rank Display */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-6">
                <div className="flex items-center gap-4">
                  {getRankIcon(data.rank)}
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Classement {getScopeLabel(scope)}
                    </div>
                    <div className={cn("text-4xl font-bold", getRankColor(data.rank))}>
                      #{data.rank}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground">sur</div>
                  <div className="text-2xl font-bold">{data.totalAthletes}</div>
                  <div className="text-xs text-muted-foreground">athlètes</div>
                </div>
              </div>

              {/* Percentile */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Percentile</span>
                  <span className="font-bold">
                    Top {(100 - data.percentile).toFixed(1)}%
                  </span>
                </div>
                <Progress value={data.percentile} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Tu es meilleur que {data.percentile.toFixed(0)}% des athlètes dans
                  cette catégorie
                </p>
              </div>

              {/* Score */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    <span className="text-sm font-medium">Score de Performance</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {data.score.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Improvement Tips */}
              <div className="space-y-3 rounded-lg border bg-gradient-to-br from-primary/5 to-purple-600/5 p-4">
                <div className="flex items-center gap-2">
                  <ChevronUp className="size-4 text-primary" />
                  <span className="text-sm font-semibold">
                    Comment améliorer ton rang ?
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-primary">•</span>
                    <span>
                      Ajoute régulièrement tes performances pour gagner de l'XP
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-primary">•</span>
                    <span>
                      Améliore tes statistiques dans les matchs pour augmenter ton score
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-primary">•</span>
                    <span>Débloque des badges pour booster ta visibilité</span>
                  </li>
                </ul>
              </div>

              {/* Location Context */}
              {(data.region || data.country) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>
                    {data.region && `${data.region}`}
                    {data.country && `, ${data.country}`}
                  </span>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
