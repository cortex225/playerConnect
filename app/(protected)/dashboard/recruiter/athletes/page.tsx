import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import AthletesTable from "@/components/dashboard/datatable/AthletesTable";

export const metadata = constructMetadata({
  title: "Athletes - Player Connect",
  description: "Decouvrez et recrutez les meilleurs athletes.",
});

export const dynamic = 'force-dynamic';

export default async function AthletesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
          <Users className="size-5 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-urban text-2xl font-bold text-transparent">
            Athletes
          </h1>
          <p className="text-sm text-muted-foreground">
            Decouvrez et recrutez les meilleurs talents
          </p>
        </div>
      </div>
      <AthletesTable />
    </div>
  );
}
