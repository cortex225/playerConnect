import { redirect } from "next/navigation";

import { dashboardConfig } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { DashboardNav } from "@/components/layout/dashboard-sidenav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { NavMobile } from "@/components/layout/mobile-nav";

import { adminConfig } from "../../config/admin";

interface ProtectedLayoutProps {
  children?: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const navItems = user.role === "ADMIN" 
    ? adminConfig.sidebarNav 
    : dashboardConfig.sidebarNav;

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <NavBar />
      <MaxWidthWrapper className="min-h-svh min-w-full px-8">
        <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden w-[200px] flex-col md:flex">
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
