"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, MapPin, TrendingUp, Trophy } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface TopAthlete {
  id: number;
  rank: number;
  name: string;
  image: string | null;
  sport: string;
  position: string;
  city: string | null;
  region: string | null;
  country: string | null;
  totalScore: number;
  level: number;
  xp: number;
  averagePerformance: number;
  performancesCount: number;
  badges: Array<{
    name: string;
    icon: string;
    rarity: string;
  }>;
}

const SPORTS = [
  { value: "all", label: "Tous les sports" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "FOOTBALL", label: "Football" },
  { value: "SOCCER", label: "Soccer" },
  { value: "RUGBY", label: "Rugby" },
];

export default function TopPlayers() {
  const [selectedSport, setSelectedSport] = useState("all");
  const [athletes, setAthletes] = useState<TopAthlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopAthletes();
  }, [selectedSport]);

  async function fetchTopAthletes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "10",
        ...(selectedSport !== "all" && { sport: selectedSport }),
      });

      const response = await fetch(`/api/rankings/top-athletes?${params}`);
      const data = await response.json();
      setAthletes(data.athletes || []);
    } catch (error) {
      console.error("Error fetching top athletes:", error);
    } finally {
      setLoading(false);
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-500";
    return "text-muted-foreground";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={cn("size-5", getRankColor(rank))} />;
    }
    return null;
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2">
              <Award className="size-4 text-primary" />
              <span className="text-sm font-medium">Classement des Talents</span>
            </div>
            <h2 className="font-urban text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Top Players{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                du Moment
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Découvrez les athlètes qui excellent dans leur discipline. Un classement
              basé sur les performances, la régularité et l'engagement.
            </p>

            {/* Sport Filter */}
            <div className="mt-8 flex justify-center">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport.value} value={sport.value}>
                      {sport.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Athletes Grid */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader>
                      <Skeleton className="size-20 rounded-full" />
                      <Skeleton className="mt-4 h-6 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              : athletes.map((athlete, index) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className={cn(
                        "group relative overflow-hidden transition-all hover:shadow-lg",
                        athlete.rank === 1 &&
                          "border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-background",
                        athlete.rank === 2 &&
                          "border-gray-400/50 bg-gradient-to-br from-gray-400/5 to-background",
                        athlete.rank === 3 &&
                          "border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-background"
                      )}
                    >
                      {/* Rank Badge */}
                      <div className="absolute right-4 top-4 flex items-center gap-1">
                        {getRankIcon(athlete.rank)}
                        <span
                          className={cn(
                            "text-2xl font-bold",
                            getRankColor(athlete.rank)
                          )}
                        >
                          #{athlete.rank}
                        </span>
                      </div>

                      <CardHeader className="pb-4">
                        {/* Avatar */}
                        <Avatar className="size-20 border-2 border-primary/20">
                          <AvatarImage src={athlete.image || ""} alt={athlete.name} />
                          <AvatarFallback>
                            {athlete.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="mt-4">
                          <CardTitle className="text-xl">{athlete.name}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {athlete.sport}
                            </Badge>
                            <span className="text-xs">{athlete.position}</span>
                          </CardDescription>
                          {(athlete.city || athlete.region) && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3" />
                              <span>
                                {athlete.city}
                                {athlete.region && `, ${athlete.region}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Score</div>
                            <div className="text-lg font-bold">
                              {Math.round(athlete.totalScore)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Niveau</div>
                            <div className="text-lg font-bold">{athlete.level}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Matchs</div>
                            <div className="text-lg font-bold">
                              {athlete.performancesCount}
                            </div>
                          </div>
                        </div>

                        {/* Average Performance */}
                        <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-primary" />
                            <span className="text-sm font-medium">
                              Perf. moyenne
                            </span>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            {athlete.averagePerformance}/100
                          </span>
                        </div>

                        {/* Badges */}
                        {athlete.badges.length > 0 && (
                          <div className="flex gap-2">
                            {athlete.badges.slice(0, 3).map((badge, i) => (
                              <div
                                key={i}
                                className="flex size-8 items-center justify-center rounded-full bg-primary/10"
                                title={badge.name}
                              >
                                <Award className="size-4 text-primary" />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>

          {/* View All Button */}
          {!loading && athletes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <Button size="lg" variant="outline" className="gap-2">
                Voir le classement complet
                <TrendingUp className="size-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
