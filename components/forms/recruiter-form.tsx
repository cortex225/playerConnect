"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createRecruiter } from "@/actions/create-recruiter";

import {
  recruiterFormSchema,
  type RecruiterFormValues,
} from "@/lib/validations/recruiter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/shared/icons";

export function RecruiterForm() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<RecruiterFormValues>({
    resolver: zodResolver(recruiterFormSchema),
    defaultValues: {
      organization: "",
      position: "",
      region: "",
      experience: undefined,
    },
  });



  async function onSubmit(data: RecruiterFormValues) {
    setIsPending(true);
    try {
      const result = await createRecruiter(data);
      if (result.success) {
        toast.success("Profil créé avec succès!");
        router.push("/dashboard");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Créer votre profil Recruteur</CardTitle>
        <CardDescription>
          Remplissez les informations ci-dessous pour compléter votre profil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations sur l'organisation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations professionnelles</h3>
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de votre organisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste</FormLabel>
                    <FormControl>
                      <Input placeholder="Poste occupé (e.g. Manager)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Informations supplémentaires */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations complémentaires</h3>

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre région (e.g. Île-de-France)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expérience (en années)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nombre d'années d'expérience"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Créer mon profil
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}