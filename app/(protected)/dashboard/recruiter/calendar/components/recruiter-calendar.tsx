"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, CalendarIcon, Clock, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  location?: string;
  description?: string;
  color?: string;
  athleteId?: number;
  athleteName?: string;
}

export function RecruiterCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();

  // Charger les événements depuis l'API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/recruiter/events");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des événements");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Gérer le clic sur un événement
  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const event = events.find((e) => e.id === eventId);

    if (event) {
      setSelectedEvent(event);
      setIsDialogOpen(true);
    }
  };

  // Fermer la boîte de dialogue
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            locale={frLocale}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            editable={false}
            selectable={false}
            dayMaxEvents={true}
          />
        </CardContent>
      </Card>

      {/* Boîte de dialogue pour afficher les détails d'un événement */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Détails du match</DialogTitle>
            <DialogDescription>
              Informations sur le match auquel vous êtes invité
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-medium">{selectedEvent.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(selectedEvent.start), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
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
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              {selectedEvent.athleteName && (
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    Athlète: {selectedEvent.athleteName}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseDialog}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
