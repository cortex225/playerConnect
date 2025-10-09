"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { ROLES } from "@/lib/constants";
import { useSession } from "@/lib/hooks/use-session";
import { AthleteDialogCreate } from "@/components/modals/athlete/create";
import { RecruiterDialogCreate } from "@/components/modals/recruiter/create";

export function RoleDialogs() {
  const { session } = useSession();
  const [roleCookie, setRoleCookie] = useState<string | undefined>();

  useEffect(() => {
    setRoleCookie(Cookies.get("selectedRole"));
  }, []);

  if (!session || !roleCookie) return null;

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
