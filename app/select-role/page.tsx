"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { updateUserRole } from "@/lib/client/api";
import { ROLES } from "@/lib/constants";
import { useClientAuth } from "@/lib/hooks/use-client-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionTest } from "@/components/shared/session-test";

export default function SelectRolePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useClientAuth();

  const setRole = async (role: string, provider?: string) => {
    try {
      setLoading(role);

      // Utiliser notre helper API pour mettre à jour le rôle
      await updateUserRole(role, provider);

      // Rafraîchir la session utilisateur
      await refreshUser();

      // Rediriger vers le dashboard correspondant au rôle
      if (role === ROLES.ATHLETE) {
        router.push("/dashboard/athlete");
      } else if (role === ROLES.RECRUITER) {
        router.push("/dashboard/recruiter");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Chargement de votre profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <p className="text-red-500">Veuillez vous connecter pour continuer</p>
        <Button className="mt-4" onClick={() => router.push("/auth/login")}>
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col space-y-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Choisissez votre profil</h1>
          <p className="text-muted-foreground">
            Sélectionnez votre rôle sur la plateforme
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Athlète</CardTitle>
              <CardDescription>
                Je suis un athlète et je souhaite être visible par les
                recruteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créez votre profil, ajoutez vos performances et vos médias pour
                attirer l'attention des recruteurs.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => setRole(ROLES.ATHLETE, "google")}
                disabled={!!loading}
              >
                {loading === ROLES.ATHLETE ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continuer comme athlète
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recruteur</CardTitle>
              <CardDescription>
                Je suis un recruteur et je cherche des athlètes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Parcourez les profils d'athlètes, contactez-les et organisez des
                événements de recrutement.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => setRole(ROLES.RECRUITER, "google")}
                disabled={!!loading}
              >
                {loading === ROLES.RECRUITER ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continuer comme recruteur
              </Button>
            </CardFooter>
          </Card>
        </div>

        <SessionTest />
      </div>
    </div>
  );
}
