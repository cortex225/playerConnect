"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BarChart3, Calendar, Camera, ExternalLink } from "lucide-react";

import { createMatch } from "@/actions/create-event";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { MediaForm } from "@/components/forms/media-form";

const matchFormSchema = z.object({
  title: z.string().min(2),
  location: z.string().min(2, { message: "Le lieu doit être spécifié" }),
  gymnasium: z.string().min(2, { message: "Le gymnase doit être spécifié" }),
  homeTeam: z.string().min(2, { message: "L'équipe à domicile doit être spécifiée" }),
  awayTeam: z.string().min(2, { message: "L'équipe visiteuse doit être spécifiée" }),
  eventDate: z.date({ required_error: "Une date est requise" }),
  startTime: z.string().min(1, { message: "L'heure de début est requise" }),
  endTime: z.string().optional(),
  isPublic: z.boolean().default(true),
  requiresParentalApproval: z.boolean().default(false),
  description: z.string().optional(),
  color: z.string().optional(),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

interface AddContentDialogsProps {
  statsOpen: boolean;
  setStatsOpen: (open: boolean) => void;
  mediaOpen: boolean;
  setMediaOpen: (open: boolean) => void;
  matchOpen: boolean;
  setMatchOpen: (open: boolean) => void;
}

export function AddContentDialogs({
  statsOpen,
  setStatsOpen,
  mediaOpen,
  setMediaOpen,
  matchOpen,
  setMatchOpen,
}: AddContentDialogsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      title: "Match",
      location: "",
      gymnasium: "",
      homeTeam: "",
      awayTeam: "",
      startTime: "",
      endTime: "",
      isPublic: true,
      requiresParentalApproval: false,
      description: "",
      color: "#3b82f6",
    },
  });

  const homeTeam = form.watch("homeTeam");
  const awayTeam = form.watch("awayTeam");
  if (homeTeam && awayTeam) {
    form.setValue("title", `Match: ${homeTeam} vs ${awayTeam}`);
  }

  async function onMatchSubmit(data: MatchFormValues) {
    setIsLoading(true);
    try {
      const eventDate = new Date(data.eventDate);
      if (!data.startTime) {
        toast({ title: "Erreur", description: "Veuillez spécifier une heure de début", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      eventDate.setHours(startHours, startMinutes, 0, 0);

      let endDate: Date | null = null;
      if (data.endTime && data.endTime.trim() !== "") {
        const [endHours, endMinutes] = data.endTime.split(":").map(Number);
        endDate = new Date(data.eventDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
      }

      const result = await createMatch({
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        location: data.location,
        gymnasium: data.gymnasium,
        eventDate,
        endDate,
        isPublic: data.isPublic,
        requiresParentalApproval: data.requiresParentalApproval,
        description: data.description,
        color: data.color,
      });

      if (!result.success) {
        toast({ title: "Erreur", description: result.error || "Erreur lors de la création du match", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      toast({ title: "Match créé", description: "Le match a été ajouté à votre calendrier" });
      setMatchOpen(false);
      form.reset();
      router.refresh();
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue lors de la création du match", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Stats Sheet */}
      <Sheet open={statsOpen} onOpenChange={setStatsOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                <BarChart3 className="size-4 text-white" />
              </div>
              Ajouter des statistiques
            </SheetTitle>
            <SheetDescription>
              Renseigne tes performances pour améliorer ton profil et être repéré par les recruteurs.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-purple-600/5 p-4">
              <p className="text-sm text-muted-foreground">
                Pour ajouter des statistiques détaillées, rendez-vous sur la page dédiée où vous pouvez saisir toutes vos performances selon votre sport et votre position.
              </p>
            </div>
            <Button
              className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 text-white"
              asChild
              onClick={() => setStatsOpen(false)}
            >
              <Link href="/dashboard/athlete/performances">
                <ExternalLink className="size-4" />
                Accéder aux statistiques
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Media Sheet */}
      <Sheet open={mediaOpen} onOpenChange={setMediaOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500">
                <Camera className="size-4 text-white" />
              </div>
              Ajouter un media
            </SheetTitle>
            <SheetDescription>
              Partage tes highlights vidéo pour te faire remarquer.
            </SheetDescription>
          </SheetHeader>
          <MediaForm onSuccess={() => setMediaOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Match Dialog */}
      <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500">
                <Calendar className="size-4 text-white" />
              </div>
              Ajouter un match
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un match à votre calendrier
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onMatchSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homeTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Équipe domicile</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'équipe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="awayTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Équipe visiteuse</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'équipe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date du match</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full pl-3 text-left font-normal">
                              {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Début</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gymnasium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gymnase</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du gymnase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Informations supplémentaires sur le match" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input type="color" {...field} className="h-10 w-20 cursor-pointer" />
                      </FormControl>
                      <div className="size-10 rounded-md border" style={{ backgroundColor: field.value }} />
                    </div>
                    <FormDescription>Couleur pour identifier ce match dans le calendrier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Public</FormLabel>
                        <FormDescription>Visible pour les recruteurs</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiresParentalApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Approbation parentale</FormLabel>
                        <FormDescription>Nécessite l&apos;approbation des parents</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
                  Ajouter le match
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
