"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { format, isFuture, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  location?: string;
  description?: string;
  color?: string;
  athleteId?: number;
  athleteName?: string;
  athleteImage?: string;
  athleteSport?: string;
  invitationStatus?: string;
  invitationId?: number;
}

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "ACCEPTED") {
    return (
      <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
        Accepte
      </Badge>
    );
  }
  return (
    <Badge className="border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100">
      En attente
    </Badge>
  );
}

export function RecruiterCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/recruiter/events");
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur API:", errorText);
          throw new Error("Erreur lors du chargement des evenements");
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Format de donnees invalide:", data);
          throw new Error("Format de donnees invalide");
        }

        setEvents(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de charger les evenements",
          variant: "destructive",
        });
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => {
        const date = typeof e.start === "string" ? parseISO(e.start) : e.start;
        return isToday(date) || isFuture(date);
      })
      .sort((a, b) => {
        const dateA = typeof a.start === "string" ? parseISO(a.start) : a.start;
        const dateB = typeof b.start === "string" ? parseISO(b.start) : b.start;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [events]);

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const event = events.find((e) => e.id === eventId);

    if (event) {
      setSelectedEvent(event);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-primary to-purple-600" />
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <p className="text-muted-foreground">
                Chargement des evenements...
              </p>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridWeek" : "dayGridMonth"}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: isMobile
                  ? "timeGridWeek,timeGridDay"
                  : "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              locale={frLocale}
              events={events.map((event) => ({
                ...event,
                className:
                  event.invitationStatus === "ACCEPTED"
                    ? "fc-event-blue"
                    : "fc-event-amber",
              }))}
              eventClick={handleEventClick}
              height="auto"
              editable={false}
              selectable={false}
              dayMaxEvents={true}
              buttonText={{
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
            />
          )}
        </CardContent>
      </Card>

      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Prochains evenements</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const startDate =
                typeof event.start === "string"
                  ? parseISO(event.start)
                  : event.start;
              return (
                <Card
                  key={event.id}
                  className="cursor-pointer border-0 shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDialogOpen(true);
                  }}
                >
                  <CardContent className="flex gap-3 p-4">
                    <div className="flex min-w-[48px] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 px-2 py-1 text-white">
                      <span className="text-xs font-medium uppercase">
                        {format(startDate, "MMM", { locale: fr })}
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {format(startDate, "dd")}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium">{event.title}</p>
                        <StatusBadge status={event.invitationStatus} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarImage src={event.athleteImage || ""} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(event.athleteName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm text-muted-foreground">
                          {event.athleteName}
                        </span>
                        {event.athleteSport && (
                          <Badge variant="secondary" className="text-[10px]">
                            {event.athleteSport}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {format(startDate, "HH:mm", { locale: fr })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Details du match</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={selectedEvent.athleteImage || ""} />
                  <AvatarFallback>
                    {getInitials(selectedEvent.athleteName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{selectedEvent.athleteName}</p>
                  <div className="flex items-center gap-2">
                    {selectedEvent.athleteSport && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedEvent.athleteSport}
                      </Badge>
                    )}
                    <StatusBadge status={selectedEvent.invitationStatus} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-lg bg-muted/50 p-3">
                <h3 className="font-semibold">{selectedEvent.title}</h3>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    {format(
                      new Date(selectedEvent.start),
                      "EEEE d MMMM yyyy",
                      { locale: fr },
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedEvent.start), "HH:mm", {
                      locale: fr,
                    })}
                    {selectedEvent.end &&
                      ` - ${format(new Date(selectedEvent.end), "HH:mm", {
                        locale: fr,
                      })}`}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedEvent?.invitationStatus === "ACCEPTED" && (
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/dashboard/recruiter/messages");
                  handleCloseDialog();
                }}
              >
                <MessageCircle className="mr-2 size-4" />
                Contacter l&apos;athlete
              </Button>
            )}
            <Button onClick={handleCloseDialog}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
