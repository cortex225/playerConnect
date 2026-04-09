"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AthleteCalendar } from "./components/athlete-calendar";

interface SharedEvent {
  id: string;
  message: string | null;
  createdAt: string;
  seen: boolean;
  event: {
    id: number;
    title: string;
    eventDate: string;
    endDate: string | null;
    location: string;
    description: string | null;
  };
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Invitation {
  id: number;
  status: string;
  sentAt: string;
  recruiterName: string;
  event: {
    id: number;
    title: string;
    eventDate: string;
    endDate: string | null;
    location: string;
    description: string | null;
  };
}

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "partages" | "invitations">("calendar");
  const [sharedEvents, setSharedEvents] = useState<SharedEvent[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Fetch shared events
  useEffect(() => {
    if (activeTab !== "partages") return;
    setLoadingShared(true);
    fetch("/api/events/share")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSharedEvents(Array.isArray(data) ? data : []))
      .catch(() => setSharedEvents([]))
      .finally(() => setLoadingShared(false));
  }, [activeTab]);

  // Fetch invitations
  useEffect(() => {
    if (activeTab !== "invitations") return;
    setLoadingInvitations(true);
    fetch("/api/matches/invitations?status=PENDING")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setInvitations(Array.isArray(data) ? data : []))
      .catch(() => setInvitations([]))
      .finally(() => setLoadingInvitations(false));
  }, [activeTab]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
          <CalendarDays className="size-5 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-urban text-2xl font-bold text-transparent">
            Calendrier
          </h1>
          <p className="text-sm text-muted-foreground">
            Tes matchs, partages et invitations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: "calendar" as const, label: "Mes matchs", icon: CalendarDays },
          { id: "partages" as const, label: "Partages", icon: Share2 },
          { id: "invitations" as const, label: "Invitations", icon: UserPlus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "border-primary bg-primary text-white"
                : "hover:bg-accent"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "calendar" && <AthleteCalendar />}

      {activeTab === "partages" && (
        <div className="space-y-3">
          {loadingShared ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : sharedEvents.length === 0 ? (
            <div className="rounded-2xl bg-muted/30 p-8 text-center">
              <Share2 className="mx-auto size-10 text-muted-foreground/40" />
              <h3 className="mt-3 font-urban text-lg font-semibold">Aucun partage</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Quand d'autres athletes partagent des matchs avec toi, ils apparaitront ici
              </p>
            </div>
          ) : (
            sharedEvents.map((share) => (
              <Card key={share.id} className="overflow-hidden rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={share.sender.image || ""} />
                      <AvatarFallback className="text-xs">
                        {share.sender.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{share.sender.name}</span>{" "}
                        <span className="text-muted-foreground">t'a partage un match</span>
                      </p>
                      <div className="mt-2 rounded-xl border bg-muted/30 p-3">
                        <p className="font-semibold">{share.event.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {format(new Date(share.event.eventDate), "d MMM yyyy", { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {format(new Date(share.event.eventDate), "HH:mm")}
                          </span>
                          {share.event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {share.event.location}
                            </span>
                          )}
                        </div>
                        {share.message && (
                          <p className="mt-2 text-sm italic text-muted-foreground">
                            "{share.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "invitations" && (
        <div className="space-y-3">
          {loadingInvitations ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="rounded-2xl bg-muted/30 p-8 text-center">
              <Users className="mx-auto size-10 text-muted-foreground/40" />
              <h3 className="mt-3 font-urban text-lg font-semibold">Aucune invitation</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Les demandes de recruteurs pour assister a tes matchs apparaitront ici
              </p>
            </div>
          ) : (
            invitations.map((inv) => (
              <Card key={inv.id} className="overflow-hidden rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      En attente
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(inv.sentAt), "d MMM", { locale: fr })}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold">{inv.event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{inv.recruiterName}</span> veut assister a ce match
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" />
                      {format(new Date(inv.event.eventDate), "d MMM yyyy HH:mm", { locale: fr })}
                    </span>
                    {inv.event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {inv.event.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Refuser
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white">
                      Accepter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
