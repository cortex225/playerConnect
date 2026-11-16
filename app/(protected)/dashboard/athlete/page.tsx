import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/shell";
import { AthleteOverview } from "@/components/dashboard/dashboard-athlete/athlete-overview";

export const metadata = constructMetadata({
  title: "Ma fiche - PlayerConnect",
  description: "Ta fiche athlète, tes notes de match et ton calendrier.",
});

export const dynamic = "force-dynamic";

export default async function AthleteDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ATHLETE") redirect("/");

  return (
    <DashboardShell className="px-4 pt-2 md:px-0">
      <AthleteOverview userId={user.id} />
    </DashboardShell>
  );
}
