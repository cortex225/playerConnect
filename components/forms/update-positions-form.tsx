"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAthletePositions } from "@/actions/update-athlete-positions";
import { Position, Sport } from "@prisma/client";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/extension/multi-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const updatePositionsSchema = z.object({
  positions: z.array(z.string()),
});

type UpdatePositionsFormValues = z.infer<typeof updatePositionsSchema>;

interface UpdatePositionsFormProps {
  athleteId: number;
  sportId: string;
  currentPositions: string[];
}

export function UpdatePositionsForm({ athleteId, sportId, currentPositions }: UpdatePositionsFormProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<UpdatePositionsFormValues>({
    resolver: zodResolver(updatePositionsSchema),
    defaultValues: {
      positions: currentPositions,
    },
  });

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch(`/api/sports/${sportId}/positions`);
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("Erreur lors du chargement des positions");
      }
    };

    fetchPositions();
  }, [sportId]);

  const onSubmit = async (data: UpdatePositionsFormValues) => {
    setIsPending(true);

    try {
      const result = await updateAthletePositions(athleteId, data.positions);
      if (result.success) {
        toast.success("Positions mises à jour avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour des positions");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="positions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Positions</FormLabel>
              <MultiSelector
                values={field.value || []}
                onValuesChange={field.onChange}
              >
                <FormControl>
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder="Sélectionnez vos positions" />
                  </MultiSelectorTrigger>
                </FormControl>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {positions.map((position) => (
                      <MultiSelectorItem
                        key={position.id}
                        value={position.id.toString()}
                      >
                        {position.name}
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending && (
            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
          )}
          Mettre à jour les positions
        </Button>
      </form>
    </Form>
  );
}
