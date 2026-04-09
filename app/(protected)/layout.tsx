import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { adminConfig } from "@/config/admin";
import { dashboardConfig } from "@/config/dashboard";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/server/session";
import { getSportIcon } from "@/lib/sport-icons";
import { RoleDialogs } from "@/components/dialogs/role-dialogs";
import { AthleteTopBar } from "@/components/layout/athlete-top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DashboardNav } from "@/components/layout/dashboard-sidenav";
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

  // Fetch athlete data for the mobile top bar
  let athleteTopBarProps: {
    name: string | null;
    image: string | null;
    sportIcon: string;
    level: number;
    xp: number;
    xpProgress: number;
    streak: number;
  } | null = null;

  if (user.role === ROLES.ATHLETE) {
    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      include: {
        sport: { select: { name: true } },
        _count: { select: { performances: true } },
      },
    });

    if (athlete) {
      const level = athlete.level || 1;
      const xp = athlete.xp || 0;
      const LEVEL_XP = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
      const currentLevelXP = LEVEL_XP[level - 1] || 0;
      const nextLevelXP = LEVEL_XP[level] || 10000;
      const xpProgress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

      athleteTopBarProps = {
        name: user.name ?? null,
        image: user.image ?? null,
        sportIcon: getSportIcon(athlete.sport?.name || "BASKETBALL"),
        level,
        xp,
        xpProgress,
        streak: athlete._count.performances,
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:space-y-6">
      {/* Modal de sélection de rôle pour l'onboarding */}
      <RoleDialogs roleCookie={roleCookie} />

      {/* Mobile: athlete top bar replaces navbar */}
      {athleteTopBarProps ? (
        <>
          <AthleteTopBar {...athleteTopBarProps} />
          {/* Desktop: keep the normal navbar */}
          <div className="hidden md:block">
            <NavBar />
          </div>
        </>
      ) : (
        <NavBar />
      )}
      <MaxWidthWrapper className="min-h-svh min-w-full px-0 md:px-8">
        <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden w-[200px] flex-col md:flex">
            <DashboardNav items={navItems as any} userRole={user.role} />
          </aside>

          <main className="flex w-full flex-1 flex-col overflow-hidden pb-20 md:pb-0">
            {children}
          </main>
        </div>
      </MaxWidthWrapper>
      <SiteFooter className="hidden border-t md:block" />

      {/* Mobile Bottom Tab Bar */}
      <BottomNav userRole={user.role} />
    </div>
  );
}
