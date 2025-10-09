import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Messagerie } from "@/components/chat/messagerie";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Billing – SaaS Starter",
  description: "Manage billing and your subscription plan.",
});

export const dynamic = 'force-dynamic';

export default async function AthletesPage() {
  const user = await getCurrentUser();

  // let userSubscriptionPlan;
  // if (user && user.id && user.role === "USER") {
  //     userSubscriptionPlan = await getUserSubscriptionPlan(user.id);
  // } else {
  //     redirect("/login");
  // }

  return (
    <DashboardShell>
      <DashboardHeader heading="Messages" text="Manage your messages." />
      <div className="grid gap-8">
        <Messagerie />
      </div>
    </DashboardShell>
  );
}
