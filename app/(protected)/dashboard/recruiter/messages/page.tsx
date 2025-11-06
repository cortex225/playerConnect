import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { SecureMessagerie } from "@/components/chat/secure-messagerie";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Messages – Player Connect",
  description: "Communiquez avec les athlètes de manière sécurisée et professionnelle.",
});

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await getCurrentUser();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Messages"
        text="Communiquez avec les athlètes de manière sécurisée et professionnelle."
      />
      <div className="grid gap-8">
        <SecureMessagerie />
      </div>
    </DashboardShell>
  );
}
