import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { adminConfig } from "@/config/admin";
import { dashboardConfig } from "@/config/dashboard";
import { ROLES } from "@/lib/constants";
import { getServerSession } from "@/lib/server/session";
import { RoleDialogs } from "@/components/dialogs/role-dialogs";
import { DashboardNav } from "@/components/layout/dashboard-sidenav";
import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface ProtectedLayoutProps {
  children?: React.ReactNode;
}

// Configuration des redirections par rôle
const ROLE_DASHBOARDS = {
  [ROLES.ATHLETE]: "/dashboard/athlete",
  [ROLES.RECRUITER]: "/dashboard/recruiter",
  [ROLES.USER]: "/auth/login", // Rediriger les utilisateurs sans rôle vers la connexion
} as const;

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getServerSession();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Récupérer le cookie selectedRole pour l'affichage du bon modal
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("selectedRole")?.value;

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user || !user.isLoggedIn) {
    redirect("/auth/login");
  }

  // Gestion des redirections par rôle avec persistance de session
  const expectedPath = ROLE_DASHBOARDS[user.role];

  // Si l'utilisateur a le rôle USER (onboarding en cours), permettre l'accès au dashboard
  // Le modal d'onboarding (CreateAthleteModal ou CreateRecruiterModal) se chargera de la suite
  if (user.role === ROLES.USER) {
    console.log(
      "[Layout] Utilisateur en cours d'onboarding (rôle USER), affichage du dashboard avec modal",
    );
    // Laisser passer - le modal d'onboarding s'affichera automatiquement
  }

  // Pour les autres rôles (ATHLETE, RECRUITER), rediriger vers le bon dashboard
  if (expectedPath && user.role !== ROLES.USER) {
    // Pages autorisées pour tous les rôles
    const allowedPaths = [
      expectedPath, // Le dashboard spécifique au rôle
      "/dashboard/settings", // Page de paramètres
      "/onboarding", // Pages d'onboarding
    ];

    const isOnAllowedPath = allowedPaths.some((path) =>
      pathname.startsWith(path)
    );

    // Si l'utilisateur n'est pas sur une page autorisée, le rediriger vers son dashboard
    if (!isOnAllowedPath && pathname !== expectedPath) {
      console.log(
        `[Layout] Redirection de ${pathname} vers ${expectedPath} pour rôle ${user.role}`,
      );
      redirect(expectedPath);
    }
  }

  // Choisir la navigation en fonction du rôle
  const navItems =
    user.role === ROLES.ADMIN
      ? adminConfig.sidebarNav
      : dashboardConfig.sidebarNav;

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      {/* Modal de sélection de rôle pour l'onboarding */}
      <RoleDialogs roleCookie={roleCookie} />

      <NavBar />
      <MaxWidthWrapper className="min-h-svh min-w-full px-8">
        <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden w-[200px] flex-col md:flex ">
            <DashboardNav items={navItems as any} userRole={user.role} />
          </aside>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <NavMobile items={navItems as any} userRole={user.role} />
          </div>

          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </MaxWidthWrapper>
      <SiteFooter className="border-t" />
    </div>
  );
}
