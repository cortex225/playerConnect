import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Bell, MessageCircle, PieChart, Search } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Composants de fallback pour le chargement
const TopAthletesFallback = () => (
  <div className="h-[45vh] w-full rounded-lg border bg-card p-6">
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-60" />
    </div>
    <div className="mt-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
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
  <div className="h-full w-full rounded-lg border bg-card p-6">
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-60" />
    </div>
    <div className="mt-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border bg-card shadow-sm"
        >
          <div className="flex items-center gap-3 border-b p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/login");

  return (
    <DashboardShell>
      <header className="rounded-2xl bg-background p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          {/* Section gauche : Avatar et infos */}
          <div className="flex justify-between">
            <ConnectedRecruiter />
            {/* Icônes de notification et messagerie */}
            <div className="mx-9 flex items-center justify-end space-x-2">
              {/* Notification */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Bell className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>New athlete profile added</DropdownMenuItem>
                  <DropdownMenuItem>Upcoming match reminder</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Messages */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Message from John Doe</DropdownMenuItem>
                  <DropdownMenuItem>Chat with coaching staff</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Section droite : Recherche et actions */}
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <form className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search athletes..."
                className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              />
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Quick Stats */}
            <QuickStats />
          </div>

          <div className="flex flex-col gap-6">
            {/* Matches Carousel */}
            <UpcomingMatches />

            {/* Recruitment Progress */}
            {/* <RecruitmentProgress /> */}
          </div>

          <div className="flex flex-col gap-6">
            {/* Top Athletes */}
            <Suspense fallback={<TopAthletesFallback />}>
              <TopAthletes />
            </Suspense>
          </div>
        </div>

        {/* Aside for athlete media */}
        <aside className="w-full md:w-[30%]">
          <Suspense fallback={<MediaAthleteFallback />}>
            <MediaAthlete />
          </Suspense>
        </aside>
      </div>
    </DashboardShell>
  );
}
