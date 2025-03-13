"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createMatch } from "@/actions/create-event";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";

// Schéma de validation pour le formulaire de match
const matchFormSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères",
  }),
  location: z.string().min(2, {
    message: "Le lieu doit être spécifié",
  }),
  gymnasium: z.string().min(2, {
    message: "Le gymnase doit être spécifié",
  }),
  homeTeam: z.string().min(2, {
    message: "L'équipe à domicile doit être spécifiée",
  }),
  awayTeam: z.string().min(2, {
    message: "L'équipe visiteuse doit être spécifiée",
  }),
  eventDate: z.date({
    required_error: "Une date est requise",
  }),
  startTime: z.string().min(1, {
    message: "L'heure de début est requise",
  }),
  endTime: z.string().optional(),
  isPublic: z.boolean().default(false),
  requiresParentalApproval: z.boolean().default(false),
  description: z.string().optional(),
  color: z.string().optional(),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

export function CreateMatchModal() {
  const [open, setOpen] = useState(false);
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
      color: "#3b82f6", // Bleu par défaut
    },
  });

  // Mettre à jour le titre du match lorsque les équipes changent
  useEffect(() => {
    const homeTeam = form.watch("homeTeam");
    const awayTeam = form.watch("awayTeam");

    if (homeTeam && awayTeam) {
      form.setValue("title", `Match: ${homeTeam} vs ${awayTeam}`);
    }
  }, [form.watch("homeTeam"), form.watch("awayTeam"), form]);

  async function onSubmit(data: MatchFormValues) {
    setIsLoading(true);
    console.log("Soumission du formulaire avec les données:", data);

    try {
      // Créer un objet Date pour l'heure de début
      const eventDate = new Date(data.eventDate);
      // Vérifier que l'heure de début est bien définie
      if (!data.startTime) {
        toast({
          title: "Erreur",
          description: "Veuillez spécifier une heure de début",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      eventDate.setHours(startHours, startMinutes, 0, 0);

      // Créer un objet Date pour l'heure de fin si elle est spécifiée
      let endDate: Date | null = null;
      if (data.endTime && data.endTime.trim() !== "") {
        const [endHours, endMinutes] = data.endTime.split(":").map(Number);
        // Créer une nouvelle instance de Date pour éviter de modifier eventDate
        endDate = new Date(data.eventDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
      }

      console.log("Appel de createMatch avec:", {
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        location: data.location,
        gymnasium: data.gymnasium,
        eventDate,
        endDate,
        isPublic: data.isPublic,
        requiresParentalApproval: data.requiresParentalApproval,
        color: data.color,
      });

      // Appeler la server action pour créer le match
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

      console.log("Résultat de createMatch:", result);

      if (!result.success) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création du match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Match créé",
        description: "Le match a été ajouté à votre calendrier",
      });

      // Fermer la modal et rafraîchir la page
      setOpen(false);
      form.reset(); // Réinitialiser le formulaire
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la création du match:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du match",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          Ajouter un match
          <Icons.calendar className="ml-2 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un match</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour ajouter un match à votre calendrier
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ caché pour le titre */}
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
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
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
                      <FormLabel>Heure de début</FormLabel>
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
                      <FormLabel>Heure de fin</FormLabel>
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
                    <Textarea
                      placeholder="Informations supplémentaires sur le match"
                      {...field}
                    />
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
                      <Input
                        type="color"
                        {...field}
                        className="h-10 w-20 cursor-pointer"
                        onChange={(e) => {
                          console.log("Couleur sélectionnée:", e.target.value);
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <div
                      className="h-10 w-10 rounded-md border"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormDescription>
                    Choisissez une couleur pour identifier ce match dans le
                    calendrier
                  </FormDescription>
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
                      <FormDescription>
                        Rendre ce match visible pour les recruteurs
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                      <FormDescription>
                        Nécessite l&apos;approbation des parents
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Ajouter le match
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
