"use client";

import { ROLES } from "@/lib/constants";
import { useSession } from "@/lib/hooks/use-session";
import { AthleteDialogCreate } from "@/components/modals/athlete/create";
import { RecruiterDialogCreate } from "@/components/modals/recruiter/create";

export function RoleDialogs({ roleCookie }: { roleCookie?: string }) {
  const { session } = useSession();

  if (!session) return null;

  
  return (
    <>
      {session.role === ROLES.USER && roleCookie === ROLES.ATHLETE && (
        <AthleteDialogCreate />
      )}
      {session.role === ROLES.USER && roleCookie === ROLES.RECRUITER && (
        <RecruiterDialogCreate />
      )}
    </>
  );
}
