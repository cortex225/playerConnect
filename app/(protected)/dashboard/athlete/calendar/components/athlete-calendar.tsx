"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  CalendarIcon,
  Check,
  Clock,
  MapPin,
  Palette,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  location?: string;
  description?: string;
  isPublic?: boolean;
  color?: string;
}

const eventColors = [
  { name: "Bleu", value: "blue", class: "bg-blue-500" },
  { name: "Rouge", value: "red", class: "bg-red-500" },
  { name: "Vert", value: "green", class: "bg-green-500" },
  { name: "Jaune", value: "yellow", class: "bg-yellow-500" },
  { name: "Violet", value: "purple", class: "bg-purple-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
];

const colorMap: Record<string, string> = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
};

export function AthleteCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [invitationCounts, setInvitationCounts] = useState<
    Record<string, { pending: number; accepted: number }>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Detecter mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Charger les evenements depuis l'API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
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

  // Charger les invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch("/api/events/invitations");
        if (response.ok) {
          const data = await response.json();
          setInvitationCounts(data);
        }
      } catch (e) {
        console.error("Erreur:", e);
      }
    };
    fetchInvitations();
  }, [events]);

  // Prochains evenements tries par date
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.start) >= now)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [events]);

  // Gerer la creation d'un nouvel evenement
  const handleDateSelect = (selectInfo: any) => {
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);

    if (selectInfo.view.type === "dayGridMonth") {
      end.setDate(end.getDate() - 1);
    }

    const startTimeHours = start.getHours().toString().padStart(2, "0");
    const startTimeMinutes = start.getMinutes().toString().padStart(2, "0");
    const formattedStartTime = `${startTimeHours}:${startTimeMinutes}`;

    let formattedEndTime = "";
    if (
      selectInfo.view.type === "timeGridWeek" ||
      selectInfo.view.type === "timeGridDay"
    ) {
      const endTimeHours = end.getHours().toString().padStart(2, "0");
      const endTimeMinutes = end.getMinutes().toString().padStart(2, "0");
      formattedEndTime = `${endTimeHours}:${endTimeMinutes}`;
    } else {
      const endDate = new Date(start);
      endDate.setHours(endDate.getHours() + 1);
      const endTimeHours = endDate.getHours().toString().padStart(2, "0");
      const endTimeMinutes = endDate.getMinutes().toString().padStart(2, "0");
      formattedEndTime = `${endTimeHours}:${endTimeMinutes}`;
    }

    setStartDate(start);
    setEndDate(selectInfo.view.type === "dayGridMonth" ? start : end);
    setStartTime(formattedStartTime);
    setEndTime(formattedEndTime);

    setSelectedEvent({
      id: "",
      title: "",
      start: start.toISOString(),
      end: (selectInfo.view.type === "dayGridMonth"
        ? start
        : end
      ).toISOString(),
      allDay: selectInfo.allDay,
      location: "",
      description: "",
      isPublic: true,
      color: "blue",
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // Gerer le clic sur un evenement existant
  const handleEventClick = (clickInfo: any) => {
    const event = events.find((e) => e.id === clickInfo.event.id);
    if (event) {
      const startDate = new Date(event.start);
      const endDate = event.end ? new Date(event.end) : new Date(startDate);

      setStartDate(startDate);
      setEndDate(endDate);
      setStartTime(format(startDate, "HH:mm"));
      setEndTime(format(endDate, "HH:mm"));

      setSelectedEvent({
        ...event,
        color: event.color || "blue",
      });
      setIsEditMode(true);
      setIsDialogOpen(true);
    }
  };

  // Gerer le clic sur un evenement depuis la liste
  const handleUpcomingEventClick = (event: Event) => {
    const sd = new Date(event.start);
    const ed = event.end ? new Date(event.end) : new Date(sd);

    setStartDate(sd);
    setEndDate(ed);
    setStartTime(format(sd, "HH:mm"));
    setEndTime(format(ed, "HH:mm"));

    setSelectedEvent({
      ...event,
      color: event.color || "blue",
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Combiner la date et l'heure
  const combineDateAndTime = (
    date: Date | undefined,
    timeString: string,
  ): Date => {
    if (!date) return new Date();

    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  // Sauvegarder un evenement (creation ou modification)
  const handleSaveEvent = async () => {
    if (!selectedEvent || !selectedEvent.title || !startDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const startDateTime = combineDateAndTime(startDate, startTime);
      const endDateTime = combineDateAndTime(endDate || startDate, endTime);

      if (endDateTime < startDateTime) {
        toast({
          title: "Erreur",
          description: "La date de fin doit etre apres la date de debut",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const eventToSave = {
        ...selectedEvent,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      };

      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `/api/events/${selectedEvent.id}`
        : "/api/events";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API:", errorText);
        throw new Error(
          `Erreur lors de la ${isEditMode ? "modification" : "creation"} de l'evenement`,
        );
      }

      const savedEvent = await response.json();

      if (isEditMode) {
        setEvents(
          events.map((e) => (e.id === savedEvent.id ? savedEvent : e)),
        );
      } else {
        setEvents([...events, savedEvent]);
      }

      setIsDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Succes",
        description: `Evenement ${isEditMode ? "modifie" : "cree"} avec succes`,
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: `Impossible de ${isEditMode ? "modifier" : "creer"} l'evenement`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un evenement
  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API:", errorText);
        throw new Error("Erreur lors de la suppression de l'evenement");
      }

      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      setIsDialogOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Succes",
        description: "Evenement supprime avec succes",
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'evenement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generer les options d'heure pour les selecteurs
  const generateTimeOptions = () => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const openNewEventDialog = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

    setStartDate(now);
    setEndDate(now);
    setStartTime(format(now, "HH:mm"));
    setEndTime(format(nextHour, "HH:mm"));

    setSelectedEvent({
      id: "",
      title: "",
      start: now.toISOString(),
      end: nextHour.toISOString(),
      allDay: false,
      location: "",
      description: "",
      isPublic: true,
      color: "blue",
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <CalendarDays className="mx-auto size-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions rapides */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {events.length} evenement{events.length !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={openNewEventDialog}
          className="rounded-xl bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="mr-2 size-4" />
          Nouveau
        </Button>
      </div>

      {/* Calendrier */}
      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-600/5 pb-2">
          <CardTitle className="font-urban text-lg">Calendrier</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={isMobile ? "listWeek" : "dayGridMonth"}
            headerToolbar={
              isMobile
                ? {
                    left: "prev,next",
                    center: "title",
                    right: "listWeek,dayGridMonth",
                  }
                : {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }
            }
            locale={frLocale}
            events={events.map((event) => ({
              ...event,
              className: `fc-event-${event.color || "blue"}`,
            }))}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
            themeSystem="standard"
            buttonText={{
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              list: "Liste",
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
          />
        </CardContent>
      </Card>

      {/* Prochains evenements */}
      <div className="mt-6">
        <h3 className="mb-3 font-urban text-lg font-semibold">
          Prochains evenements
        </h3>
        <div className="space-y-3">
          {upcomingEvents.slice(0, 5).map((event) => (
            <div
              key={event.id}
              onClick={() => handleUpcomingEventClick(event)}
              className="flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all hover:bg-accent"
            >
              {/* Badge date */}
              <div className="flex size-14 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-primary/10 to-purple-600/10">
                <span className="text-xs font-medium text-muted-foreground">
                  {format(new Date(event.start), "MMM", {
                    locale: fr,
                  }).toUpperCase()}
                </span>
                <span className="text-xl font-bold text-primary">
                  {format(new Date(event.start), "d")}
                </span>
              </div>
              {/* Info evenement */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{event.title}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {format(new Date(event.start), "HH:mm")}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="size-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              {/* Badge + couleur */}
              <div className="flex items-center gap-2">
                {invitationCounts[event.id] && (
                  <Badge variant="secondary" className="text-xs">
                    {invitationCounts[event.id].pending +
                      invitationCounts[event.id].accepted}{" "}
                    recruteur
                    {invitationCounts[event.id].pending +
                      invitationCounts[event.id].accepted !==
                    1
                      ? "s"
                      : ""}
                  </Badge>
                )}
                {event.isPublic && (
                  <Badge variant="secondary" className="text-xs">
                    Public
                  </Badge>
                )}
                <div
                  className="size-3 rounded-full"
                  style={{
                    backgroundColor:
                      colorMap[event.color || "blue"] || colorMap.blue,
                  }}
                />
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun evenement a venir. Cliquez sur le calendrier pour en creer
              un.
            </p>
          )}
        </div>
      </div>

      {/* Dialog creation/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[500px]">
          <DialogHeader className="-mx-6 -mt-6 rounded-t-2xl bg-gradient-to-r from-primary/10 to-purple-600/10 px-6 pb-4 pt-6">
            <DialogTitle className="font-urban text-xl font-bold">
              {isEditMode ? "Modifier l'evenement" : "Nouvel evenement"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les details de votre evenement ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Suivi des invitations */}
            {isEditMode &&
              selectedEvent &&
              invitationCounts[selectedEvent.id] && (
                <div className="rounded-xl bg-gradient-to-r from-primary/5 to-purple-600/5 p-4">
                  <h4 className="mb-2 text-sm font-semibold">
                    Demandes de recruteurs
                  </h4>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {invitationCounts[selectedEvent.id].pending}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        En attente
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {invitationCounts[selectedEvent.id].accepted}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Acceptees
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Titre de l'evenement
              </Label>
              <Input
                id="title"
                placeholder="Ajouter un titre"
                className="rounded-2xl"
                value={selectedEvent?.title || ""}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent!,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">
                  <CalendarIcon className="mr-1 inline size-3.5" /> Debut
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start rounded-2xl text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      {startDate ? (
                        format(startDate, "dd MMM yyyy", { locale: fr })
                      ) : (
                        <span>Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  <Clock className="mr-1 inline size-3.5" /> Heure
                </Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">
                  <CalendarIcon className="mr-1 inline size-3.5" /> Fin
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start rounded-2xl text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      {endDate ? (
                        format(endDate, "dd MMM yyyy", { locale: fr })
                      ) : (
                        <span>Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  <Clock className="mr-1 inline size-3.5" /> Heure
                </Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-medium">
                <MapPin className="mr-1 inline size-3.5" /> Lieu
              </Label>
              <Input
                id="location"
                placeholder="Ajouter un lieu"
                className="rounded-2xl"
                value={selectedEvent?.location || ""}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent!,
                    location: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Ajouter une description"
                value={selectedEvent?.description || ""}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent!,
                    description: e.target.value,
                  })
                }
                className="min-h-[80px] rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">
                <Palette className="mr-1 inline size-3.5" /> Couleur
              </Label>
              <div className="mt-1 flex flex-wrap gap-3">
                {eventColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 transition-all",
                      selectedEvent?.color === color.value
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:bg-accent",
                    )}
                    onClick={() =>
                      setSelectedEvent({
                        ...selectedEvent!,
                        color: color.value,
                      })
                    }
                  >
                    <div
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full",
                        color.class,
                      )}
                    >
                      {selectedEvent?.color === color.value && (
                        <Check className="size-3.5 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
              <div>
                <Label htmlFor="isPublic" className="font-medium">
                  Evenement public
                </Label>
                <p className="text-xs text-muted-foreground">
                  Les recruteurs pourront voir et demander a assister a cet
                  evenement.
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={selectedEvent?.isPublic || false}
                onCheckedChange={(checked) =>
                  setSelectedEvent({
                    ...selectedEvent!,
                    isPublic: checked,
                  })
                }
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-purple-600"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <div>
              {isEditMode && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isLoading}
                  className="rounded-xl"
                >
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveEvent}
                disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-primary to-purple-600"
              >
                {isEditMode ? "Mettre a jour" : "Creer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-urban">
              Supprimer cet evenement ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. L'evenement sera definitivement
              supprime ainsi que toutes les demandes de recruteurs associees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
