"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ROLES } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/shared/icons";

const userRoleSchema = z.object({
  role: z.enum(["ATHLETE", "RECRUITER"]),
});

type FormData = z.infer<typeof userRoleSchema>;

export function UserRoleForm() {
  const router = useRouter();
  const { session } = useSession();
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      role: (session?.role === "ATHLETE" || session?.role === "RECRUITER") ? session.role : undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/user/role", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: data.role,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du rôle");
        }

        toast({
          title: "Rôle mis à jour",
          description: "Votre rôle a été mis à jour avec succès.",
        });

        router.refresh();
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la mise à jour du rôle.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Votre rôle</CardTitle>
          <CardDescription>
            Sélectionnez votre rôle sur la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            <Select
              {...register("role")}
              defaultValue={session?.role || "USER"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.ATHLETE}>Athlète</SelectItem>
                <SelectItem value={ROLES.RECRUITER}>Recruteur</SelectItem>
              </SelectContent>
            </Select>
            {errors?.role && (
              <p className="px-1 text-xs text-red-600">{errors.role.message}</p>
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
            <span>Mettre à jour le rôle</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
