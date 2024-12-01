
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Position, SportType } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  performanceFormSchema,
  sportStats,
  type PerformanceFormValues,
} from "@/lib/validations/performance";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/shared/icons";

interface PerformanceFormProps {
  positions: Position[];
  sportType: SportType;
  onSubmit: (values: PerformanceFormValues) => Promise<void>;
}

export function PerformanceForm({
  positions,
  sportType,
  onSubmit,
}: PerformanceFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceFormSchema),
    defaultValues: {
      date: new Date(),
      positionId: "",
      stats: sportStats[sportType].map((stat) => ({
        key: stat.key,
        value: 0,
      })),
    },
  });

  async function onSubmitForm(values: PerformanceFormValues) {
    setIsPending(true);

    try {
      await onSubmit(values);
      toast.success("Statistiques ajoutées avec succès");
      form.reset();
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout des statistiques");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter des statistiques</CardTitle>
            <CardDescription>
              Ajoutez vos statistiques pour suivre votre progression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                            date > new Date() || date < new Date("1900-01-01")
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
                  <FormItem>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Ajouter les statistiques
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
