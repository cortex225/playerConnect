import { ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { RoleAutoUpdater } from "@/components/dashboard/role-auto-updater";
import { DashboardShell } from "@/components/dashboard/shell";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export const metadata = constructMetadata({
  title: "Accueil – Player Connect",
  description: "Create and manage content.",
});

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Si l'utilisateur n'a pas de rôle défini, afficher le composant de mise à jour automatique
  if (user?.role === ROLES.USER) {
    return (
      <DashboardShell>
        <RoleAutoUpdater />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Panel"
        text={`Current Role : ${user?.role} — Change your role in settings.`}
      />
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>No content created</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any content yet. Start creating content.
          </EmptyPlaceholder.Description>
          <Button variant="outline">Fake button</Button>
        </EmptyPlaceholder>
      </div>
    </DashboardShell>
  );
}
