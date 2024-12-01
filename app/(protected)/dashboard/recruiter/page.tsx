import { redirect } from "next/navigation";
import { Bell, MessageCircle, PieChart, Search } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ConnectedRecruiter from "@/components/dashboard/dashboard-recruiter/connected-recruiter";
import { LittleCalendar } from "@/components/dashboard/dashboard-recruiter/little-calendar";
import { QuickStats } from "@/components/dashboard/dashboard-recruiter/quick-stats";
import { RecruitmentProgress } from "@/components/dashboard/dashboard-recruiter/recruitment-progress";
import { TopAthletes } from "@/components/dashboard/dashboard-recruiter/top-athletes";
import UpcomingMatches from "@/components/dashboard/dashboard-recruiter/upcoming-matches";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Accueil – Player Connect",
  description: "Create and manage content.",
});

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
            <div className="flex items-center justify-end space-x-2">
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
      <div>
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Quick Stats */}
          <QuickStats />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Matches Carousel */}
          <UpcomingMatches />

          {/* Recruitment Progress */}
          <RecruitmentProgress />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Top Athletes */}

          <TopAthletes />

          {/* Calendar */}
          <LittleCalendar />
        </div>
      </div>
    </DashboardShell>
  );
}
