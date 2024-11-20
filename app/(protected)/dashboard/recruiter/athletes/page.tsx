import {redirect} from "next/navigation";

import {getCurrentUser} from "@/lib/session";
import {constructMetadata} from "@/lib/utils";
import {DashboardHeader} from "@/components/dashboard/header";
import {DashboardShell} from "@/components/dashboard/shell";

import AthletesTable from "@/components/dashboard/datatable/AthletesTable";

export const metadata = constructMetadata({
    title: "Billing – SaaS Starter",
    description: "Manage billing and your subscription plan.",
});

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
            <DashboardHeader
                heading="All Athletes"
                text="Manage your athletes and their profiles."
            />
            <div className="grid gap-8">
                <AthletesTable/>
            </div>
        </DashboardShell>
    );
}
