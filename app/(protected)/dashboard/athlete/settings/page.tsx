import { redirect } from "next/navigation";
import { Settings, Star, ImageIcon, Calendar, ChevronDown } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import prisma from "@/lib/db";
import { getSportIcon, getSportGradient } from "@/lib/sport-icons";
import type { Performance, SportType } from "@/types";

import { DashboardShell } from "@/components/dashboard/shell";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { UserNameForm } from "@/components/forms/user-name-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

import { PerformanceStats } from "@/components/dashboard/dashboard-athlete/performance-stats";
import { KPIChart } from "@/components/dashboard/dashboard-athlete/kpi-chart";
import { RankingWidget } from "@/components/dashboard/dashboard-athlete/ranking-widget";
import { GamificationWidget } from "@/components/dashboard/dashboard-athlete/gamification-widget";

export const metadata = constructMetadata({
  title: "Mon Profil – Player Connect",
  description: "Ton profil athletique complet : stats, badges, classement et parametres.",
});

export const dynamic = "force-dynamic";

// XP thresholds per level (level n requires n * 500 XP to progress)
function getLevelProgress(xp: number, level: number) {
  const xpForCurrentLevel = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  return {
    progress: Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100)),
    xpInCurrentLevel: Math.max(0, xpInCurrentLevel),
    xpNeeded,
  };
}

export default async function AthleteProfilePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");
  if (user.role !== "ATHLETE") redirect("/dashboard");

  // Fetch full athlete profile data
  const athlete = await prisma.athlete.findUnique({
    where: { userId: user.id },
    include: {
      sport: { select: { id: true, name: true } },
      category: { select: { name: true } },
      performances: {
        select: {
          id: true,
          score: true,
          date: true,
          athleteId: true,
          positionId: true,
          position: { select: { id: true, name: true, sportId: true } },
          KPI: { select: { id: true, name: true, value: true, weight: true, positionId: true, performanceId: true } },
        },
        orderBy: { date: "desc" },
        take: 20,
      },
      _count: { select: { performances: true, media: true, events: true } },
    },
  });

  // Fetch positions for the sport (needed by PerformanceStats)
  const positions =
    athlete?.sport?.id
      ? await prisma.position.findMany({
          where: { sportId: athlete.sport.id },
          select: { id: true, name: true, sportId: true },
        })
      : [];

  // Derive display values
  const displayName = user.name ?? "Athlète";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sportName = athlete?.sport?.name ?? null;
  const categoryName = athlete?.category?.name ?? null;
  const sportIcon = getSportIcon(sportName);
  const sportGradient = getSportGradient(sportName);

  const mediaCount = athlete?._count?.media ?? 0;
  const performancesCount = athlete?._count?.performances ?? 0;
  const totalScore = Math.round(athlete?.totalScore ?? 0);
  const level = athlete?.level ?? 1;
  const xp = athlete?.xp ?? 0;
  const { progress: xpProgress, xpInCurrentLevel, xpNeeded } = getLevelProgress(xp, level);

  // Cast performances to the type expected by client components
  const performances = (athlete?.performances ?? []) as Performance[];

  return (
    <DashboardShell className="gap-0 pb-24 md:pb-8">

      {/* ===== PROFILE HEADER ===== */}
      <section className="relative overflow-hidden">
        {/* Gradient banner */}
        <div className={`h-28 w-full bg-gradient-to-r ${sportGradient} opacity-90`} />

        {/* Avatar + core info */}
        <div className="relative -mt-12 px-4 pb-4">
          <div className="flex items-end justify-between">
            {/* Avatar with sport icon overlay */}
            <div className="relative">
              <Avatar className="size-24 ring-4 ring-background">
                <AvatarImage src={user.image ?? undefined} alt={displayName} />
                <AvatarFallback
                  className={`bg-gradient-to-br ${sportGradient} text-2xl font-bold text-white`}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Sport emoji badge */}
              <span
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-background text-base shadow-md"
                role="img"
                aria-label={sportName ?? "sport"}
              >
                {sportIcon}
              </span>
            </div>

            {/* Level badge */}
            <div className="flex flex-col items-end gap-1 pb-1">
              <Badge
                className={`bg-gradient-to-r ${sportGradient} border-0 px-3 py-1 text-sm font-bold text-white`}
              >
                <Star className="mr-1 size-3" />
                Niv. {level}
              </Badge>
            </div>
          </div>

          {/* Name + sport + category */}
          <div className="mt-3">
            <h1 className="text-xl font-bold leading-tight">{displayName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {sportName && (
                <Badge variant="secondary" className="text-xs font-medium">
                  {sportIcon} {sportName}
                </Badge>
              )}
              {categoryName && (
                <Badge variant="outline" className="text-xs">
                  {categoryName}
                </Badge>
              )}
            </div>
          </div>

          {/* Stat counters (Instagram-style) */}
          <div className="mt-4 flex divide-x divide-border rounded-xl border bg-card p-3">
            <div className="flex flex-1 flex-col items-center gap-0.5 px-2">
              <ImageIcon className="mb-0.5 size-4 text-muted-foreground" />
              <span className="text-lg font-bold leading-none">{mediaCount}</span>
              <span className="text-[11px] text-muted-foreground">Médias</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 px-2">
              <Calendar className="mb-0.5 size-4 text-muted-foreground" />
              <span className="text-lg font-bold leading-none">{performancesCount}</span>
              <span className="text-[11px] text-muted-foreground">Matchs</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 px-2">
              <Star className="mb-0.5 size-4 text-muted-foreground" />
              <span className="text-lg font-bold leading-none">{totalScore}</span>
              <span className="text-[11px] text-muted-foreground">Score</span>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                XP : {xp.toLocaleString("fr-FR")} pts
              </span>
              <span className="text-muted-foreground">
                {xpInCurrentLevel} / {xpNeeded} vers Niv. {level + 1}
              </span>
            </div>
            <Progress
              value={xpProgress}
              className="h-2"
            />
          </div>
        </div>
      </section>

      <div className="mt-2 space-y-4 px-4">

        {/* ===== PERFORMANCE STATS ===== */}
        {athlete && positions.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-primary" />
              Performances
            </h2>
            <PerformanceStats
              positions={positions}
              sportType={(sportName as SportType) ?? "SOCCER"}
              performances={performances}
            />
          </section>
        )}

        {/* ===== KPI RADAR CHART ===== */}
        {performances.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-purple-500" />
              Indicateurs Clés (KPI)
            </h2>
            <KPIChart performances={performances} />
          </section>
        )}

        {/* ===== RANKING WIDGET ===== */}
        {athlete && athlete.sport?.id && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-yellow-500" />
              Classement
            </h2>
            <RankingWidget athleteId={athlete.id} sportId={athlete.sport.id} />
          </section>
        )}

        {/* ===== GAMIFICATION / TROPHÉES ===== */}
        {athlete && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-urban text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-amber-500" />
              Trophées
            </h2>
            <GamificationWidget
              athleteId={athlete.id}
              level={level}
              xp={xp}
            />
          </section>
        )}

        {/* ===== ACCOUNT SETTINGS (collapsible) ===== */}
        <section className="pt-2">
          <Separator className="mb-4" />
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <Settings className="size-4 text-muted-foreground" />
                  <span className="font-medium">Paramètres du compte</span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              <UserNameForm />
              <DeleteAccountSection />
            </CollapsibleContent>
          </Collapsible>
        </section>

      </div>
    </DashboardShell>
  );
}
