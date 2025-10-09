"use client";

import { useEffect, useState } from "react";
import type {
  PerformanceFormProps,
  PerformanceFormValues,
  SportStats,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, FileUp, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { StatsParser } from "@/components/forms/stats-parser";
import { Icons } from "@/components/shared/icons";
import { createPerformance } from "@/actions/performance"

const sportStats: Record<string, Array<{ key: string; label: string }>> = {
  FOOTBALL: [
    { key: "goals", label: "Buts" },
    { key: "assists", label: "Passes décisives" },
    { key: "shots", label: "Tirs" },
    { key: "passes", label: "Passes" },
    { key: "minutes", label: "Minutes jouées" },
  ],
  BASKETBALL: [
    { key: "points", label: "Points" },
    { key: "rebounds", label: "Rebonds" },
    { key: "assists", label: "Passes décisives" },
    { key: "steals", label: "Interceptions" },
    { key: "blocks", label: "Contres" },
  ],
};

const performanceFormSchema = z.object({
  date: z.date(),
  positionId: z.string(),
  stats: z.array(
    z.object({
      key: z.string(),
      value: z.number(),
    }),
  ),
});

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Import du document",
    description: "Importez votre document contenant les statistiques",
  },
  {
    id: 2,
    title: "Vérification",
    description: "Vérifiez et ajustez les données extraites",
  },
];

export function PerformanceForm({
  positions,
  sportType,
}: PerformanceFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [extractedStats, setExtractedStats] = useState<
    Array<{ key: string; value: number }>
  >([]);

  const form = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceFormSchema),
    defaultValues: {
      date: new Date(),
      positionId: "",
      stats:
        sportStats[sportType]?.map((stat) => ({
          key: stat.key,
          value: 0,
        })) || [],
    },
  });

  // Mettre à jour le formulaire avec les stats extraites
  useEffect(() => {
    if (extractedStats.length > 0) {
      const updatedStats = form.getValues("stats").map((stat) => {
        const extractedStat = extractedStats.find((es) => es.key === stat.key);
        return extractedStat ? extractedStat : stat;
      });
      form.setValue("stats", updatedStats);
    }
  }, [extractedStats, form]);

  const handleStatsExtracted = (
    stats: Array<{ key: string; value: number }>,
  ) => {
    setExtractedStats(stats);
    toast.success("Document importé avec succès");
    setCurrentStep(2);
  };

  async function onSubmitForm(values: PerformanceFormValues) {
    setIsPending(true);
    try {
      const result = await createPerformance(values);
      if (result.error) throw new Error(result.error);
      toast.success("Statistiques ajoutées avec succès");
      form.reset();
      setCurrentStep(1);
      setExtractedStats([]);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout des statistiques");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Ajouter des statistiques</CardTitle>
            {/* Stepper */}
            <div className="mt-4">
              <nav aria-label="Progress">
                <ol
                  role="list"
                  className="space-y-4 md:flex md:space-x-8 md:space-y-0"
                >
                  {steps.map((step) => (
                    <li key={step.id} className="md:flex-1">
                      <div
                        className={cn(
                          "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4",
                          step.id < currentStep
                            ? "border-primary"
                            : step.id === currentStep
                              ? "border-blue-600"
                              : "border-gray-200",
                        )}
                      >
                        <span className="text-sm font-medium">
                          {step.id}. {step.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {step.description}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentStep === 1 ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <FileUp className="mx-auto size-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">
                    Importez vos statistiques
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez votre fichier ou cliquez pour sélectionner
                  </p>
                </div>
                <StatsParser onStatsExtracted={handleStatsExtracted} />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <CalendarIcon className="ml-auto size-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="positionId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((position) => (
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

                <div className="space-y-4">
                  <FormLabel>Statistiques détaillées</FormLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {form.watch("stats").map((stat, index) => (
                      <FormField
                        key={stat.key}
                        control={form.control}
                        name={`stats.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {
                                sportStats[sportType].find(
                                  (s) => s.key === stat.key,
                                )?.label
                              }
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
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
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter>
            {currentStep === 1 ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setCurrentStep(2)}
              >
                Passer l'import
              </Button>
            ) : (
              <div className="flex w-full gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Retour
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  Enregistrer les statistiques
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
