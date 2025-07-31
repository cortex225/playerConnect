import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { AthleteDialogCreate } from "@/components/modals/athlete/create";

export default async function OnboardingPage() {
  console.log("Page onboarding - Vérification de l'utilisateur");
  const user = await getCurrentUser();
  console.log("Page onboarding - User:", user?.id, user?.role);

  if (!user) {
    console.log(
      "Page onboarding - Redirection vers /auth/login (non authentifié)",
    );
    redirect("/auth/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Configuration du profil"
        text="Configurez votre profil pour commencer à utiliser la plateforme."
      />

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>État de l'authentification</CardTitle>
            <CardDescription>
              Information sur votre session utilisateur actuelle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>ID Utilisateur: {user.id}</p>
            <p>Email: {user.email || "Non défini"}</p>
            <p>Rôle: {user.role}</p>
            <p>Permissions: {user.permissions.join(", ") || "Aucune"}</p>
            <div className="mt-4">
              <Button
                onClick={() => {}} // Cette fonction ne sera pas exécutée côté serveur
                className="mr-2"
              >
                Statut actuel: {user.isLoggedIn ? "Connecté" : "Déconnecté"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AthleteDialogCreate />
      </div>
    </DashboardShell>
  );
}
