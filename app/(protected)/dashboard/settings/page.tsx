import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { AthleteProfileForm } from "@/components/forms/athlete-profile-form";
import { RecruiterProfileForm } from "@/components/forms/recruiter-profile-form";
import { UserEmailForm } from "@/components/forms/user-email-form";
import { UserNameForm } from "@/components/forms/user-name-form";
import { UserPasswordForm } from "@/components/forms/user-password-form";
import { Athlete } from "@/types"
import { Recruiter } from "@prisma/client"
import { Gender, DominantHand, DominantFoot, ProgramType } from "@prisma/client"

export const metadata = constructMetadata({
  title: "Paramètres - Player Connect",
  description: "Configurez vos paramètres de compte.",
});

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/");

  let athleteData: Athlete | null = null;
  let recruiterData: Recruiter | null = null;

  if (user.role === "ATHLETE") {
    athleteData = await prisma.athlete.findUnique({
      where: { userId: user.id },
      include: {
        sport: true,
        positions: {
          include: {
            position: true,
          },
        },
        user: true,
        category: true,
        performances: {
          include: {
            position: true,
            KPI: true,
          }
        },
      },
    });
  } else if (user.role === "RECRUITER") {
    recruiterData = await prisma.recruiter.findUnique({
      where: { userId: user.id },
    });
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Paramètres"
        text="Gérez vos paramètres de compte et votre profil."
      />
      <div className="grid gap-6">
        <div className="space-y-6">
          <div className="text-xl font-semibold">Informations de base</div>
          <UserNameForm />
          <UserEmailForm user={{ id: user.id, email: user.email || "" }} />
          <UserPasswordForm userId={user.id} />
        </div>

        {user.role === "ATHLETE" && athleteData && (
          <div className="space-y-6">
            <div className="text-xl font-semibold">Profil Athlète</div>
            <AthleteProfileForm
              athlete={{
                id: athleteData.id,
                gender: athleteData.gender as Gender,
                age: athleteData.age,
                city: athleteData.city,
                height: athleteData.height,
                weight: athleteData.weight,
                dominantHand: athleteData.dominantHand as DominantHand,
                dominantFoot: athleteData.dominantFoot as DominantFoot,
                programType: athleteData.programType as ProgramType,
                sportId: athleteData.sport?.id || null,
                positions: athleteData.positions?.map(p => p.position.id) || [],
              }}
            />
          </div>
        )}

        {user.role === "RECRUITER" && recruiterData && (
          <div className="space-y-6">
            <div className="text-xl font-semibold">Profil Recruteur</div>
            <RecruiterProfileForm
              recruiter={{
                id: recruiterData.id,
                organization: recruiterData.organization,
                position: recruiterData.position,
                region: recruiterData.region,
                experience: recruiterData.experience,
              }}
            />
          </div>
        )}

        <div className="space-y-6">
          <div className="text-xl font-semibold text-destructive">Zone de danger</div>
          <DeleteAccountSection />
        </div>
      </div>
    </DashboardShell>
  );
}
