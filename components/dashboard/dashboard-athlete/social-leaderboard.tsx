"use client";

import { useEffect, useState } from "react";
import { Crown, Flame, Heart, Medal, TrendingUp, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSportIcon } from "@/lib/sport-icons";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  sport: string | null;
  weeklyLikes: number;
  weeklyNewFollowers: number;
  score: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
  myScore: number;
}

export function SocialLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social/leaderboard")
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.leaderboard.length === 0) return null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="size-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-4 text-gray-400" />;
    if (rank === 3) return <Medal className="size-4 text-orange-500" />;
    return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/20";
    if (rank === 3) return "bg-gradient-to-r from-orange-400/10 to-orange-500/10 border-orange-400/20";
    return "";
  };

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-orange-500" />
            <CardTitle className="font-urban text-base">Classement de la semaine</CardTitle>
          </div>
          {data.myRank && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Trophy className="size-3" />
              Tu es #{data.myRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          {data.leaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-2.5 transition-all",
                getRankBg(entry.rank)
              )}
            >
              <div className="flex size-7 shrink-0 items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={entry.image || ""} />
                <AvatarFallback className="text-xs">
                  {entry.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{entry.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {entry.sport && <span>{getSportIcon(entry.sport)}</span>}
                  <span className="flex items-center gap-0.5">
                    <Heart className="size-2.5" /> {entry.weeklyLikes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users className="size-2.5" /> +{entry.weeklyNewFollowers}
                  </span>
                </div>
              </div>
              <span className="shrink-0 font-urban text-sm font-bold text-primary">
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
