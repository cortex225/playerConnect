import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { AthleteDialogCreate } from "@/components/modals/athlete/create";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Configuration du profil"
        text="Configurez votre profil pour commencer à utiliser la plateforme."
      />
      <div className="grid gap-8">
        <AthleteDialogCreate />
      </div>
    </DashboardShell>
  );
}
