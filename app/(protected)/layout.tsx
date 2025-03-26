import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { dashboardConfig } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { DashboardNav } from "@/components/layout/dashboard-sidenav";
import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { UserRole } from "@prisma/client";

import { adminConfig } from "../../config/admin";

interface ProtectedLayoutProps {
  children?: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  if (!user || !user.isLoggedIn) {
    redirect("/landing");
  }

  // Vérifier les permissions et rediriger si nécessaire
  if (user.role === UserRole.ATHLETE) {
    if (!user.permissions.includes("view:profile")) {
      redirect("/unauthorized");
    }
    // Rediriger seulement si l'utilisateur n'est pas déjà sur le bon dashboard
    if (!pathname.startsWith("/dashboard/athlete")) {
      redirect("/dashboard/athlete");
    }
  } else if (user.role === UserRole.RECRUITER) {
    if (!user.permissions.includes("view:profile")) {
      redirect("/unauthorized");
    }
    if (!pathname.startsWith("/dashboard/recruiter")) {
      redirect("/dashboard/recruiter");
    }
  } else if (user.role === UserRole.ADMIN) {
    if (!user.permissions.includes("manage:system")) {
      redirect("/unauthorized");
    }
    if (!pathname.startsWith("/dashboard/admin")) {
      redirect("/dashboard/admin");
    }
  } else {
    // Si l'utilisateur n'a pas de rôle spécifique, le rediriger vers la page de sélection de rôle
    if (pathname !== "/select-role") {
      redirect("/select-role");
    }
  }

  const navItems =
    user.role === UserRole.ADMIN ? adminConfig.sidebarNav : dashboardConfig.sidebarNav;

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <NavBar />
      <MaxWidthWrapper className="min-h-svh min-w-full px-8">
        <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden w-[200px] flex-col md:flex ">
            <DashboardNav items={navItems} />
          </aside>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <NavMobile items={navItems} />
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
