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

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { LittleCalendar } from "@/components/dashboard/dashboard-athlete/little-calendar";
import MediaCarousel from "@/components/dashboard/dashboard-athlete/media-carousel";
import { DashboardShell } from "@/components/dashboard/shell";
import { AthleteForm } from "@/components/forms/athlete-form";

const performanceData = [
  { name: "Jan", score: 30 },
  { name: "Feb", score: 45 },
  { name: "Mar", score: 55 },
  { name: "Apr", score: 70 },
  { name: "May", score: 65 },
  { name: "Jun", score: 80 },
  { name: "Jul", score: 75 },
  { name: "Aug", score: 85 },
  { name: "Sep", score: 90 },
  { name: "Oct", score: 95 },
  { name: "Nov", score: 88 },
  { name: "Dec", score: 100 },
];

const kpiData = [
  { subject: "Mon", Performance: 120, fullMark: 150 },
  { subject: "Tue", Performance: 98, fullMark: 150 },
  { subject: "Wed", Performance: 86, fullMark: 150 },
  { subject: "Thu", Performance: 99, fullMark: 150 },
  { subject: "Fri", Performance: 85, fullMark: 150 },
  { subject: "Sat", Performance: 65, fullMark: 150 },
  { subject: "Sun", Performance: 65, fullMark: 150 },
];

const topRecruiters = [
  {
    id: 1,
    name: "Sarah Thompson",
    role: "NCAA Division I Scout",
    university: "Blue Mountain University",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Professional Team Scout",
    university: "Golden State Warriors",
  },
  {
    id: 3,
    name: "Jennifer Williams",
    role: "College Recruiter",
    university: "Riverside College",
  },
  {
    id: 4,
    name: "David Chen",
    role: "Sports Academy Director",
    university: "Elite Sports Academy",
  },
  {
    id: 5,
    name: "Emily Parker",
    role: "Youth Development Scout",
    university: "National Sports Association",
  },
];

export const metadata = constructMetadata({
  title: "Profil Athlète – Player Connect",
  description: "Gérez votre profil et vos performances.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ATHLETE") redirect("/login");

  // const mediaCarouselRef = useRef<HTMLDivElement>(null)

  return (
    <DashboardShell>
      <header className="rounded-2xl bg-background p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          {/* Section gauche : Avatar et infos */}
          <div className="flex justify-between">
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
            <div className="flex items-center justify-end space-x-2">
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
                  <DropdownMenuItem>Rappel d'événement</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Message d'un recruteur</DropdownMenuItem>
                  <DropdownMenuItem>Discussion avec l'équipe</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-1">
          {/* Quick Stats */}
          <MediaCarousel />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Top Athletes */}

          {/* <TopAthletes/> */}

          {/* Calendar */}
          {/* <LittleCalendar/> */}
        </div>
      </div>
    </DashboardShell>
  );
}
