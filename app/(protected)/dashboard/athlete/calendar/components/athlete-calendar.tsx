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
import { Calendar, CalendarIcon, Clock, MapPin, Palette } from "lucide-react";

import { cn } from "@/lib/utils";
// Suppression des imports CSS problématiques
// Les styles seront appliqués via globals.css

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
  const router = useRouter();

  // Charger les événements depuis l'API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
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

  // Gérer la création d'un nouvel événement
  const handleDateSelect = (selectInfo: any) => {
    const start = new Date(selectInfo.startStr);
    const end = new Date(selectInfo.endStr);

    setStartDate(start);
    setEndDate(end);
    setStartTime("09:00");
    setEndTime("10:00");

    setSelectedEvent({
      id: "",
      title: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      location: "",
      description: "",
      isPublic: true,
      color: "blue",
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // Gérer le clic sur un événement existant
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

  // Sauvegarder un événement (création ou modification)
  const handleSaveEvent = async () => {
    if (!selectedEvent || !selectedEvent.title || !startDate) return;

    try {
      setIsLoading(true);

      // Combiner date et heure
      const startDateTime = combineDateAndTime(startDate, startTime);
      const endDateTime = combineDateAndTime(endDate || startDate, endTime);

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
        throw new Error(
          `Erreur lors de la ${isEditMode ? "modification" : "création"} de l'événement`,
        );
      }

      const savedEvent = await response.json();

      if (isEditMode) {
        setEvents(events.map((e) => (e.id === savedEvent.id ? savedEvent : e)));
      } else {
        setEvents([...events, savedEvent]);
      }

      setIsDialogOpen(false);
      toast({
        title: "Succès",
        description: `Événement ${isEditMode ? "modifié" : "créé"} avec succès`,
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: `Impossible de ${isEditMode ? "modifier" : "créer"} l'événement`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un événement
  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'événement");
      }

      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      setIsDialogOpen(false);
      toast({
        title: "Succès",
        description: "Événement supprimé avec succès",
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Générer les options d'heure pour les sélecteurs
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

  return (
    <>
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            Calendrier des événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            locale={frLocale}
            events={events.map((event) => ({
              ...event,
              className: `fc-event-${event.color || "blue"}`,
              backgroundColor: "transparent",
              borderColor: "transparent",
              textColor: "inherit",
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
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEditMode ? "Modifier l'événement" : "Ajouter un événement"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les détails de votre événement ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Titre de l'événement
              </Label>
              <Input
                id="title"
                placeholder="Ajouter un titre"
                value={selectedEvent?.title || ""}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent!, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
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
                <Label className="font-medium">Heure de début</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'heure" />
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
                <Label className="font-medium">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
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
                <Label className="font-medium">Heure de fin</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'heure" />
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
                <MapPin className="mr-1 inline h-4 w-4" /> Lieu
              </Label>
              <Input
                id="location"
                placeholder="Ajouter un lieu"
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
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">
                <Palette className="mr-1 inline h-4 w-4" /> Couleur de
                l'événement
              </Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {eventColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      color.class,
                      selectedEvent?.color === color.value
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-110",
                    )}
                    title={color.name}
                    onClick={() =>
                      setSelectedEvent({
                        ...selectedEvent!,
                        color: color.value,
                      })
                    }
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={selectedEvent?.isPublic || false}
                onCheckedChange={(checked) =>
                  setSelectedEvent({
                    ...selectedEvent!,
                    isPublic: checked,
                  })
                }
              />
              <Label htmlFor="isPublic" className="font-medium">
                Événement public
              </Label>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {isEditMode && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  disabled={isLoading}
                  className="mr-2"
                >
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEvent} disabled={isLoading}>
                {isEditMode ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
