import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import AthletesTable from "@/components/dashboard/datatable/AthletesTable";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Billing – SaaS Starter",
  description: "Manage billing and your subscription plan.",
});

export const dynamic = 'force-dynamic';

export default async function AthletesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ✅ CORRECTION CRITIQUE: Cette page devrait être pour les recruteurs uniquement
  // Les athlètes ne devraient pas voir la liste des autres athlètes
  if (user.role === "ATHLETE") {
    redirect("/dashboard/athlete");
  }

  // Seuls les recruteurs et admins peuvent voir cette page
  if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="All Athletes"
        text="Manage your athletes and their profiles."
      />
      <div className="grid gap-2">
        <AthletesTable />
      </div>
    </DashboardShell>
  );
}
