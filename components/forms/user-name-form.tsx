"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/shared/icons";

const userNameSchema = z.object({
  name: z.string().min(3).max(32),
});

type FormData = z.infer<typeof userNameSchema>;

export function UserNameForm() {
  const router = useRouter();
  const { session } = useSession();
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userNameSchema),
    defaultValues: {
      name: session?.name || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/user/name", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du nom");
        }

        toast({
          title: "Nom mis à jour",
          description: "Votre nom a été mis à jour avec succès.",
        });

        router.refresh();
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour du nom.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Votre nom</CardTitle>
          <CardDescription>
            Entrez votre nom complet ou un nom d'affichage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="name">
              Nom
            </Label>
            <Input
              id="name"
              className="w-full"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className={cn(
              "w-full",
              isPending && "cursor-not-allowed opacity-60",
            )}
            disabled={isPending}
          >
            {isPending && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            <span>Mettre à jour le nom</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
