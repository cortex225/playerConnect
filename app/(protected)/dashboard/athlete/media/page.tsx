import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DataTable } from "@/components/dashboard/datatable/data-table";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

import { columns } from "./columns";

export default async function MediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const athlete = await prisma.athlete.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      media: true,
    },
  });

  if (!athlete) redirect("/onboarding");

  const medias = athlete.media.map((media) => ({
    id: media.id,
    title: media.title,
    description: media.description,
    url: media.url,
    type: media.type,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  }));

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Médias"
        text="Gérez vos médias et vos statistiques."
      />
      <div className="grid gap-8">
        <DataTable columns={columns} data={medias} />
      </div>
    </DashboardShell>
  );
}
