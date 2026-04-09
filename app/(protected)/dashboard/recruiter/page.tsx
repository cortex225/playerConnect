import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Search } from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ConnectedRecruiter from "@/components/dashboard/dashboard-recruiter/connected-recruiter";
import MediaAthlete from "@/components/dashboard/dashboard-recruiter/media-athlete";
import { QuickStats } from "@/components/dashboard/dashboard-recruiter/quick-stats";
import { TopAthletes } from "@/components/dashboard/dashboard-recruiter/top-athletes";
import UpcomingMatches from "@/components/dashboard/dashboard-recruiter/upcoming-matches";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Accueil – Player Connect",
  description: "Create and manage content.",
});

export const dynamic = 'force-dynamic';

// Composants de fallback pour le chargement
const TopAthletesFallback = () => (
  <div className="h-[45vh] w-full rounded-2xl border bg-card p-6">
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-60" />
    </div>
    <div className="mt-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  </div>
);

const MediaAthleteFallback = () => (
  <div className="size-full rounded-2xl border bg-card p-6">
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-60" />
    </div>
    <div className="mt-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex items-center gap-3 border-b p-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full" />
          <div className="p-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickStatsFallback = () => (
  <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="size-12 rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    // Vérifier que l'utilisateur est bien un recruteur
    if (user.role !== "RECRUITER") {
      if (user.role === "ATHLETE") {
        redirect("/dashboard/athlete");
      } else {
        redirect("/dashboard");
      }
    }

    // Requêtes de données réelles
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.id },
    });

    const [totalAthletes, sentInvitations, acceptedInvitations, pendingInvitations] =
      await Promise.all([
        prisma.athlete.count(),
        recruiter
          ? prisma.invitation.count({ where: { recruiterId: recruiter.id } })
          : 0,
        recruiter
          ? prisma.invitation.count({
              where: { recruiterId: recruiter.id, status: "ACCEPTED" },
            })
          : 0,
        recruiter
          ? prisma.invitation.count({
              where: { recruiterId: recruiter.id, status: "PENDING" },
            })
          : 0,
      ]);

    return (
      <DashboardShell>
        {/* Header */}
        <header className="rounded-2xl bg-gradient-to-r from-primary/5 to-purple-600/5 p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
            <ConnectedRecruiter />
            <form className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des athletes..."
                className="w-full rounded-2xl pl-9 md:w-[300px]"
              />
            </form>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <QuickStats
            totalAthletes={totalAthletes}
            sentInvitations={sentInvitations}
            acceptedInvitations={acceptedInvitations}
            pendingInvitations={pendingInvitations}
          />
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Column (70%) */}
          <div className="flex-1 space-y-6 lg:w-[70%]">
            {/* Top Athletes */}
            <Suspense fallback={<TopAthletesFallback />}>
              <TopAthletes />
            </Suspense>

            {/* Upcoming Matches */}
            <UpcomingMatches />
          </div>

          {/* Right Column (30%) */}
          <aside className="w-full space-y-6 lg:w-[30%]">
            {/* Mini Calendar Card */}
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="rounded-t-2xl bg-gradient-to-r from-primary/10 to-purple-600/10 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-urban text-base font-bold">
                    Calendrier
                  </CardTitle>
                  <Calendar className="size-5 text-primary" />
                </div>
                <CardDescription>
                  Consultez les matchs auxquels vous etes invite
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="font-urban text-2xl font-bold">Vos matchs</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Planifiez et suivez vos prochaines observations
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full rounded-xl">
                  <Link href="/dashboard/recruiter/calendar">
                    Acceder au calendrier
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Media Feed */}
            <Suspense fallback={<MediaAthleteFallback />}>
              <MediaAthlete />
            </Suspense>
          </aside>
        </div>
      </DashboardShell>
    );
  } catch (error) {
    console.error(
      "Erreur lors du chargement du tableau de bord recruteur:",
      error,
    );
    return (
      <DashboardShell>
        <Card className="mx-auto max-w-md rounded-2xl">
          <CardHeader>
            <CardTitle className="font-urban">Erreur de chargement</CardTitle>
            <CardDescription>
              Une erreur est survenue lors du chargement de votre tableau de
              bord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Veuillez reessayer ulterieurement ou contacter le support si le
              probleme persiste.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/recruiter">
                  Reessayer
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  Retour a la connexion
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }
}
