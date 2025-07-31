import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { dashboardConfig } from "@/config/dashboard";
import { ROLES } from "@/lib/constants";
import { getServerSession } from "@/lib/server/session";
import { DashboardNav } from "@/components/layout/dashboard-sidenav";
import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { SessionTest } from "@/components/shared/session-test";

import { adminConfig } from "../../config/admin";

interface ProtectedLayoutProps {
  children?: React.ReactNode;
}

// Configuration des redirections par rôle
const ROLE_DASHBOARDS = {
  [ROLES.ADMIN]: "/dashboard/admin",
  [ROLES.ATHLETE]: "/dashboard/athlete",
  [ROLES.RECRUITER]: "/dashboard/recruiter",
  [ROLES.USER]: "/select-role",
};

// Permissions requises par rôle
const ROLE_REQUIRED_PERMISSIONS = {
  [ROLES.ADMIN]: ["manage:system"],
  [ROLES.ATHLETE]: ["view:profile"],
  [ROLES.RECRUITER]: ["view:profile"],
  [ROLES.USER]: [],
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getServerSession();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  console.log("[Layout] Vérification utilisateur:", user?.id, user?.role);

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
  if (!user || !user.isLoggedIn) {
    console.log("[Layout] Redirection vers /landing (non authentifié)");
    redirect("/landing");
  }

  // Vérifier les permissions requises pour le rôle de l'utilisateur
  const requiredPermissions = ROLE_REQUIRED_PERMISSIONS[user.role] || [];

  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasRequiredPermissions) {
      console.log(
        "[Layout] Permissions insuffisantes pour le rôle:",
        user.role,
      );
      redirect("/unauthorized");
    }
  }

  // Rediriger vers le dashboard correspondant au rôle si l'utilisateur n'y est pas déjà
  const roleDashboardPath = ROLE_DASHBOARDS[user.role];

  if (roleDashboardPath && !pathname.startsWith(roleDashboardPath)) {
    // Si l'utilisateur est sur la page de sélection de rôle et n'a pas choisi de rôle, ne pas rediriger
    if (user.role === ROLES.USER && pathname === "/select-role") {
      // Ne rien faire, laisser l'utilisateur choisir son rôle
    } else {
      console.log(`[Layout] Redirection vers ${roleDashboardPath}`);
      redirect(roleDashboardPath);
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
      <SessionTest />
    </div>
  );
}
