import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { adminConfig } from "@/config/admin";
import { dashboardConfig } from "@/config/dashboard";
import { ROLES } from "@/lib/constants";
import { getServerSession } from "@/lib/server/session";
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
  [ROLES.ADMIN]: "/dashboard",
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

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user || !user.isLoggedIn) {
    redirect("/auth/login");
  }

  // Gestion simplifiée des redirections par rôle
  const expectedPath = ROLE_DASHBOARDS[user.role];

  // Si l'utilisateur a le rôle USER (pas de rôle défini), ne rien faire pour l'instant
  // TODO: Nous devons permettre à l'utilisateur de choisir son rôle quelque part
  if (user.role === ROLES.USER) {
    console.log(
      "[Layout] Utilisateur avec rôle USER détecté, pas de redirection pour éviter la boucle",
    );
    // Pour l'instant, on laisse l'utilisateur accéder au dashboard général
  }

  // Pour les autres rôles, rediriger uniquement si nécessaire et si pas sur une page autorisée
  if (expectedPath && user.role !== ROLES.USER) {
    const isOnCorrectDashboard =
      pathname.startsWith(expectedPath) ||
      pathname.startsWith("/dashboard/settings") ||
      pathname.startsWith("/onboarding");

    if (!isOnCorrectDashboard) {
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
      <NavBar />
      <MaxWidthWrapper className="min-h-svh min-w-full px-8">
        <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden w-[200px] flex-col md:flex ">
            <DashboardNav items={navItems as any} />
          </aside>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <NavMobile items={navItems as any} />
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
