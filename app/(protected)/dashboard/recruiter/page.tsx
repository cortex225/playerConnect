import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/shell";
import { RecruiterOverview } from "@/components/dashboard/dashboard-recruiter/recruiter-overview";

export const metadata = constructMetadata({
  title: "Tableau de bord recruteur - PlayerConnect",
  description: "Ta liste d'athlètes suivis et tes prochaines observations.",
});

export const dynamic = "force-dynamic";

export default async function RecruiterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role === "ATHLETE") redirect("/dashboard/athlete");
  if (user.role !== "RECRUITER") redirect("/dashboard");

  return (
    <DashboardShell className="px-4 pt-2 md:px-0">
      <RecruiterOverview userId={user.id} />
    </DashboardShell>
  );
}
