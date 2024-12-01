import { redirect } from "next/navigation";
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  Home,
  LogOut,
  Mail,
  MessageCircle,
  Settings,
  Star,
  TrendingUp,
  Video,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { KPIChart } from "@/components/dashboard/dashboard-athlete/kpi-chart";
import MediaCarousel from "@/components/dashboard/dashboard-athlete/media-carousel";
import { PerformanceStats } from "@/components/dashboard/dashboard-athlete/performance-stats";
import { DashboardShell } from "@/components/dashboard/shell";
import { UpdatePositionsForm } from "@/components/forms/update-positions-form";

import { TopRecruiters } from "../../../../components/dashboard/dashboard-athlete/top-recruiters";

export const metadata = constructMetadata({
  title: "Profil Athlète – Player Connect",
  description: "Gérez votre profil et vos performances.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ATHLETE") redirect("/login");

  const athlete = await prisma.athlete.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      positions: {
        include: {
          position: true,
        },
      },
      sport: true,
      category: true,
    },
  });
  console.log("athlete", athlete);

  if (!athlete || !athlete.sport) {
    redirect("/onboarding");
  }

  const positions = athlete.positions.map((p) => p.position);
  console.log("positions", positions);

  return (
    <DashboardShell>
      <header className="rounded-2xl bg-background p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Section gauche : Avatar et infos */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback>
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-bold dark:text-white">
                  {user.name}
                </h1>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  Athlète
                </p>
              </div>
            </div>

            {/* Icônes de notification et messagerie */}
            <div className="flex items-center justify-start space-x-2 sm:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Bell className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Nouvelle demande de recruteur
                  </DropdownMenuItem>
                  <DropdownMenuItem>Rappel d&apos;événement</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Message d&apos;un recruteur
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Discussion avec l&apos;équipe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <div className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Media Carousel - 4 colonnes sur desktop */}
          <div className="col-span-5">
            <MediaCarousel />
          </div>
          {/* KPI Chart - 3 colonnes sur desktop */}
          <div className="col-span-2">
            <KPIChart />
          </div>
          {/* Performance Stats - 4 colonnes sur desktop */}
          <div className="col-span-7">
            <PerformanceStats
              positions={positions}
              sportType={athlete.sport.name}
            />
          </div>
          {/* Top Recruiters - 3 colonnes sur desktop */}
          <div className="col-span-7">
            <TopRecruiters />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
