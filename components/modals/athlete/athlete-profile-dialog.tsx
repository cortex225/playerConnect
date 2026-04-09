"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Athlete } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  MapPin,
  Play,
  Ruler,
  Star,
  TrendingUp,
  Trophy,
  User,
  Video,
  Weight,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { getSportIcon, getSportColor } from "@/lib/sport-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactButton } from "@/components/chat/contact-button";

interface Media {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
  createdAt: string;
}

type AthleteDialogProps = {
  athlete: Athlete;
  selectedAthlete: Athlete | null;
  onClose: () => void;
};

export default function AthleteProfileDialog({
  athlete,
  selectedAthlete,
  onClose,
}: AthleteDialogProps) {
  const [medias, setMedias] = useState<Media[]>([]);
  const [mediasLoading, setMediasLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Fetch athlete medias when dialog opens
  useEffect(() => {
    if (!selectedAthlete) return;
    setMediasLoading(true);
    fetch(`/api/media?athleteId=${athlete.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMedias(Array.isArray(data) ? data : []))
      .catch(() => setMedias([]))
      .finally(() => setMediasLoading(false));
  }, [selectedAthlete, athlete.id]);

  const bestScore =
    athlete.performances.length > 0
      ? Math.max(...athlete.performances.map((p) => p.score))
      : null;

  const mainPosition = athlete.performances[0]?.position?.name || null;

  const chartData = [...athlete.performances]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((perf) => ({
      date: format(new Date(perf.date), "dd MMM", { locale: fr }),
      score: perf.score,
    }));

  const latestKPIs = athlete.performances[0]?.KPI || [];

  const recentPerformances = [...athlete.performances]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const initials =
    athlete.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "A";

  return (
    <Dialog open={!!selectedAthlete} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Profil de {athlete.user.name}</DialogTitle>
        </VisuallyHidden>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-20 border-4 border-background shadow-lg">
              <AvatarImage src={athlete.user.image || ""} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-xl text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-urban text-2xl font-bold">
                {athlete.user.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {athlete.sport && (
                  <Badge className={cn("border text-sm", getSportColor(athlete.sport.name))}>
                    {getSportIcon(athlete.sport.name)} {athlete.sport.name}
                  </Badge>
                )}
                {athlete.category && (
                  <Badge variant="outline">{athlete.category.name}</Badge>
                )}
                {athlete.age && (
                  <span className="text-sm text-muted-foreground">
                    {athlete.age} ans
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {athlete.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {athlete.city}
                  </span>
                )}
                {athlete.height && (
                  <span className="flex items-center gap-1">
                    <Ruler className="size-3" />
                    {athlete.height} cm
                  </span>
                )}
                {athlete.weight && (
                  <span className="flex items-center gap-1">
                    <Weight className="size-3" />
                    {athlete.weight} kg
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <ContactButton
                  contactId={athlete.userId}
                  contactName={athlete.user.name || "Athlete"}
                  variant="default"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SCORE CARD */}
        <div className="grid grid-cols-3 gap-px border-y bg-border">
          <div className="bg-background p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="size-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                Meilleur score
              </span>
            </div>
            <p className="mt-1 font-urban text-2xl font-bold text-primary">
              {bestScore ? bestScore.toFixed(1) : "-"}
            </p>
          </div>
          <div className="bg-background p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground">Matchs</span>
            </div>
            <p className="mt-1 font-urban text-2xl font-bold">
              {athlete.performances.length}
            </p>
          </div>
          <div className="bg-background p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <User className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground">Position</span>
            </div>
            <p className="mt-1 truncate px-2 font-urban text-lg font-bold">
              {mainPosition || "-"}
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* PERFORMANCE CHART */}
          {chartData.length >= 2 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-4" />
                Evolution des performances
              </h3>
              <div className="h-[200px] rounded-xl bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="scoreGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* KPIs */}
          {latestKPIs.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Trophy className="size-4" />
                Indicateurs cles
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {latestKPIs.map((kpi) => (
                  <div key={kpi.id} className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">{kpi.name}</p>
                    <p className="mt-1 font-urban text-lg font-bold">
                      {kpi.value.toFixed(1)}
                    </p>
                    <Progress
                      value={Math.min(kpi.value, 100)}
                      className="mt-1 h-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHYSICAL DETAILS */}
          {(athlete.height ||
            athlete.weight ||
            athlete.dominantHand ||
            athlete.dominantFoot) && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Ruler className="size-4" />
                Details physiques
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {athlete.height && (
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Taille</p>
                    <p className="font-bold">{athlete.height} cm</p>
                  </div>
                )}
                {athlete.weight && (
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Poids</p>
                    <p className="font-bold">{athlete.weight} kg</p>
                  </div>
                )}
                {athlete.dominantHand && (
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Main</p>
                    <p className="font-bold">
                      {athlete.dominantHand === "DROITE"
                        ? "Droitier"
                        : "Gaucher"}
                    </p>
                  </div>
                )}
                {athlete.dominantFoot && (
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Pied</p>
                    <p className="font-bold">
                      {athlete.dominantFoot === "DROITE" ? "Droit" : "Gauche"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MEDIAS */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Video className="size-4" />
              Medias et highlights
            </h3>
            {mediasLoading ? (
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-video w-48 shrink-0 rounded-xl" />
                ))}
              </div>
            ) : medias.length === 0 ? (
              <div className="rounded-xl bg-muted/30 p-6 text-center">
                <Video className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun media disponible
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Playing video */}
                {playingVideo && (
                  <div className="overflow-hidden rounded-xl">
                    <video
                      src={playingVideo}
                      controls
                      autoPlay
                      className="aspect-video w-full rounded-xl bg-black"
                    >
                      Votre navigateur ne supporte pas la lecture video.
                    </video>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 w-full text-xs text-muted-foreground"
                      onClick={() => setPlayingVideo(null)}
                    >
                      Fermer la video
                    </Button>
                  </div>
                )}

                {/* Thumbnails row */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {medias.map((media) => (
                    <button
                      key={media.id}
                      onClick={() => setPlayingVideo(media.url)}
                      className="group relative aspect-video w-48 shrink-0 overflow-hidden rounded-xl bg-black transition-all hover:ring-2 hover:ring-primary"
                    >
                      {/* Video thumbnail preview */}
                      <video
                        src={media.url}
                        preload="metadata"
                        muted
                        playsInline
                        className="absolute inset-0 size-full object-cover"
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget;
                          video.currentTime = 1;
                        }}
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
                        <div className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                          <Play className="size-4 text-primary" />
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="truncate text-xs font-medium text-white">
                          {media.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PERFORMANCE HISTORY */}
          {recentPerformances.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="size-4" />
                Historique recent
              </h3>
              <div className="space-y-2">
                {recentPerformances.map((perf) => (
                  <div
                    key={perf.id}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <div className="min-w-[70px] text-xs text-muted-foreground">
                      {format(new Date(perf.date), "dd MMM yy", {
                        locale: fr,
                      })}
                    </div>
                    {perf.position && (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs"
                      >
                        {perf.position.name}
                      </Badge>
                    )}
                    <div className="flex-1">
                      <Progress value={perf.score} className="h-2" />
                    </div>
                    <span className="min-w-[45px] text-right font-urban font-bold text-primary">
                      {perf.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
