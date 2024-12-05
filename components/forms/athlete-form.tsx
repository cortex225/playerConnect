"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAthlete } from "@/actions/create-athlete";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CategoryLevel,
  DominantFoot,
  DominantHand,
  Gender,
  ProgramType,
  Sport,
} from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  athleteFormSchema,
  type AthleteFormValues,
} from "@/lib/validations/athlete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/extension/multi-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/shared/icons";

interface Position {
  id: string;
  name: string;
  sportId: string;
}

export function AthleteForm() {
  const [sports, setSports] = useState<
    Array<Sport & { positions: Position[] }>
  >([]);
  const [currentSportPositions, setCurrentSportPositions] = useState<
    Position[]
  >([]);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      gender: undefined,
      age: undefined,
      city: "",
      height: undefined,
      weight: undefined,
      dominantHand: undefined,
      dominantFoot: undefined,
      programType: undefined,
      categoryId: undefined,
      sportId: undefined,
      positions: [], // On garde le tableau pour la compatibilité avec le schema
    },
  });

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("/api/sports");
        const data = await response.json();
        setSports(data);
      } catch (error) {
        console.error("Error fetching sports:", error);
        toast.error("Erreur lors du chargement des sports");
      }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    const sportId = form.watch("sportId");
    if (sportId) {
      const selectedSport = sports.find((sport) => sport.id === sportId);
      setCurrentSportPositions(selectedSport?.positions || []);
    } else {
      setCurrentSportPositions([]);
    }
  }, [form.watch("sportId"), sports]);

  const onSubmit = async (data: AthleteFormValues) => {
    setIsPending(true);

    try {
      await createAthlete(data);
      toast.success("Profil créé avec succès");
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création du profil");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Profil Athlète</CardTitle>
            <CardDescription>
              Créez votre profil d'athlète pour être visible par les recruteurs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Gender).map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âge</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Entrez votre âge"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez votre ville" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Taille en cm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poids (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Poids en kg"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dominantHand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main dominante</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DominantHand).map((hand) => (
                            <SelectItem key={hand} value={hand}>
                              {hand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dominantFoot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pied dominant</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DominantFoot).map((foot) => (
                            <SelectItem key={foot} value={foot}>
                              {foot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Informations sportives */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="programType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de programme</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de programme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProgramType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset position when sport changes
                        form.setValue("positions", []);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        // On met la position sélectionnée dans un tableau pour maintenir la compatibilité
                        field.onChange([value]);
                      }}
                      defaultValue={field.value?.[0] || undefined}
                      disabled={!form.watch("sportId")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentSportPositions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Créer le profil
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
