import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default async function SelectRolePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await getCurrentUser();
  const cookieStore = cookies();
  const selectedRole = searchParams.role?.toUpperCase();

  if (!user) {
    redirect("/");
  }

  // Si un rôle est spécifié dans l'URL, on le stocke dans un cookie
  if (selectedRole && Object.values(ROLES).includes(selectedRole as any)) {
    cookieStore.set("selectedRole", selectedRole, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });
  }

  // Redirection vers le dashboard approprié
  if (user.role === ROLES.ADMIN) {
    redirect("/dashboard/admin");
  } else if (user.role === ROLES.ATHLETE) {
    redirect("/dashboard/athlete");
  } else if (user.role === ROLES.RECRUITER) {
    redirect("/dashboard/recruiter");
  } else {
    // Si l'utilisateur n'a pas de rôle spécifique, on le redirige vers la page d'accueil
    redirect("/");
  }

  return (
    <MaxWidthWrapper className="flex min-h-screen items-center justify-center">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Athlète</h2>
          <p className="mb-4 text-muted-foreground">
            Créez votre profil d'athlète et connectez-vous avec des recruteurs.
          </p>
          <form action="/api/role/athlete" method="POST">
            <Button type="submit" className="w-full">
              Devenir Athlète
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Recruteur</h2>
          <p className="mb-4 text-muted-foreground">
            Découvrez des athlètes talentueux et gérez vos recrutements.
          </p>
          <form action="/api/role/recruiter" method="POST">
            <Button type="submit" className="w-full">
              Devenir Recruteur
            </Button>
          </form>
        </Card>
      </div>
    </MaxWidthWrapper>
  );
}
