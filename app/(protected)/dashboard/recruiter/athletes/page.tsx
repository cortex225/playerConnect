import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import AthletesTable from "@/components/dashboard/datatable/AthletesTable";

export const metadata = constructMetadata({
  title: "Athlètes - PlayerConnect",
  description: "Recherche d'athlètes par sport, position et niveau.",
});

export const dynamic = 'force-dynamic';

export default async function AthletesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/");

  return (
    <div className="space-y-5 px-4 pb-24 pt-2 md:px-0 md:pb-10">
      <header className="border-b pb-5">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">Athlètes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtre par sport, position et niveau. Touche un profil pour voir ses
          matchs et ses médias.
        </p>
      </header>
      <AthletesTable />
    </div>
  );
}
