"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  Camera,
  Home,
  MessageCircle,
  Plus,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddContentDialogs } from "@/components/dashboard/dashboard-athlete/add-content-dialogs";

interface BottomNavProps {
  userRole: string;
}

const ATHLETE_TABS = [
  { label: "Accueil", icon: Home, path: "" },
  { label: "Calendrier", icon: CalendarDays, path: "/calendar" },
  null, // center button placeholder
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profil", icon: Settings, path: "/settings" },
];

const RECRUITER_TABS = [
  { label: "Accueil", icon: Home, path: "" },
  { label: "Athlètes", icon: Users, path: "/athletes" },
  { label: "Calendrier", icon: CalendarDays, path: "/calendar" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profil", icon: Settings, path: "/settings" },
];

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const isRecruiter = userRole === "RECRUITER";

  const baseRoute = isRecruiter ? "/dashboard/recruiter" : "/dashboard/athlete";

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);

  if (isRecruiter) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
        <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
          {RECRUITER_TABS.map((tab) => {
            const href = `${baseRoute}${tab.path}`;
            const isActive =
              tab.path === "" ? pathname === baseRoute : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className="size-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
        <div className="relative flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
          {ATHLETE_TABS.map((tab, index) => {
            if (tab === null) {
              return (
                <div key="center" className="flex flex-1 flex-col items-center justify-center">
                  <button
                    onClick={() => setAddSheetOpen(true)}
                    className="relative -mt-6 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/40 ring-4 ring-background transition-transform active:scale-90"
                    aria-label="Ajouter du contenu"
                  >
                    <Plus className="size-6 text-white" />
                    {/* Glow pulse ring */}
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  </button>
                </div>
              );
            }

            const href = `${baseRoute}${tab.path}`;
            const isActive =
              tab.path === "" ? pathname === baseRoute : pathname.startsWith(href);

            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className="size-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add Options Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-10">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-center text-base">Que veux-tu ajouter ?</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4">
            {/* Media - primary action */}
            <button
              onClick={() => { setAddSheetOpen(false); setMediaOpen(true); }}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-b from-purple-600/10 to-pink-500/10 p-6 transition-all active:scale-95"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-500/30">
                <Camera className="size-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Media</p>
                <p className="text-[11px] text-muted-foreground">Vidéos & highlights</p>
              </div>
            </button>

            {/* Match */}
            <button
              onClick={() => { setAddSheetOpen(false); setMatchOpen(true); }}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-orange-500/30 bg-gradient-to-b from-pink-500/10 to-orange-500/10 p-6 transition-all active:scale-95"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 shadow-md shadow-orange-500/20">
                <Calendar className="size-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Match</p>
                <p className="text-[11px] text-muted-foreground">Ajouter au calendrier</p>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Shared form dialogs */}
      <AddContentDialogs
        statsOpen={false}
        setStatsOpen={() => {}}
        mediaOpen={mediaOpen}
        setMediaOpen={setMediaOpen}
        matchOpen={matchOpen}
        setMatchOpen={setMatchOpen}
      />
    </>
  );
}
