import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { SecureMessagerie } from "@/components/chat/secure-messagerie";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Messages – Player Connect",
  description: "Communiquez en toute sécurité avec les recruteurs.",
});

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await getCurrentUser();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Messages"
        text="Communiquez en toute sécurité avec les recruteurs. Vos messages sont protégés."
      />
      <div className="grid gap-8">
        <SecureMessagerie />
      </div>
    </DashboardShell>
  );
}
