"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

import { SidebarNavItem } from "@/types/nav";
import { adminConfig } from "@/config/admin";
import { dashboardConfig } from "@/config/dashboard";
import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { ROLES } from "@/lib/constants";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DocsSearch } from "@/components/docs/search";
import { ModalContext } from "@/components/modals/providers";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import { NavMobile } from "./mobile-nav";
import { UserAccountNav } from "./user-account-nav";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

interface MainNavProps {
  items?: NavItem[];
  children?: React.ReactNode;
}

export function MainNav({ items, children }: MainNavProps) {
  const pathname = usePathname();
  const { session, loading } = useSession();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <span className="hidden font-bold sm:inline-block">PlayerConnect</span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60",
                item.disabled && "cursor-not-allowed opacity-80",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <NavMobile items={items || []} />
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <nav className="flex items-center space-x-2">
          {session?.isLoggedIn ? (
            <UserAccountNav />
          ) : (
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-4",
              )}
            >
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}

export function NavBar({ scroll = false, large = false }: NavBarProps) {
  const scrolled = useScroll(50);
  const { session, loading } = useSession();
  const { setShowSignInModal } = useContext(ModalContext);
  const pathname = usePathname();

  const selectedLayout = useSelectedLayoutSegment();
  const admin = selectedLayout === "admin";
  const dashBoard = selectedLayout === "dashboard";
  const documentation = selectedLayout === "docs";

  const configMap = {
    docs: docsConfig.mainNav,
    dashboard: dashboardConfig.mainNav,
  };

  const links =
    (selectedLayout && configMap[selectedLayout]) || marketingConfig.mainNav;

  // Détermine si on est sur une page de dashboard correspondant au rôle
  const isUserOnDashboardPage =
    (session?.role === ROLES.ADMIN && selectedLayout === "admin") ||
    (session?.role === ROLES.ATHLETE &&
      selectedLayout === "dashboard-athlete") ||
    (session?.role === ROLES.RECRUITER &&
      selectedLayout === "dashboard-recruiter");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all",
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b",
      )}
    >
      <MaxWidthWrapper
        className="flex h-14 items-center justify-between py-4"
        large={documentation}
      >
        {/* Logo */}
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo-1.png"
              width={100}
              height={100}
              alt="logo Player Connect"
            />
            <span className="font-urban text-xl font-bold">
              {siteConfig.name}
            </span>
          </Link>

          {/* Navigation Links */}
          {links && links.length > 0 ? (
            <nav className="hidden gap-6 md:flex">
              {(admin ? adminConfig.mainNav : links).map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        {/* Right-side Header */}
        <div className="flex items-center space-x-3">
          {documentation ? (
            <div className="hidden flex-1 items-center space-x-4 sm:justify-end lg:flex">
              <div className="hidden lg:flex lg:grow-0">
                <DocsSearch />
              </div>
              <div className="flex space-x-4">
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icons.gitHub className="size-7" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </div>
            </div>
          ) : null}

          {/* Authenticated state */}
          {loading ? (
            <div className="hidden lg:flex">
              <Skeleton className="size-9 rounded-full" />
            </div>
          ) : session?.isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <UserAccountNav />
            </div>
          ) : (
            <Button
              className="hidden gap-2 px-4 md:flex"
              variant="default"
              size="sm"
              onClick={() => setShowSignInModal(true)}
            >
              <span>Se connecter</span>
              <Icons.arrowRight className="size-4" />
            </Button>
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}

interface NavbarProps {
  items?: SidebarNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  showAuthButton?: boolean;
  setShowAuthModal?: (show: boolean) => void;
}

export function Navbar({
  items,
  children,
  rightElements,
  showAuthButton = true,
  setShowAuthModal,
}: NavbarProps) {
  const { session, loading } = useSession();
  const segment = useSelectedLayoutSegment();

  return (
    <div className="flex h-16 items-center border-b px-4">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">PlayerConnect</span>
        </Link>

        {items?.length ? (
          <nav className="flex gap-6">
            {items.map((item) => {
              const isActive = item.href
                ? segment === item.href.split("/")[1]
                : false;

              if (
                item.roles &&
                session?.role &&
                !item.roles.includes(session.role)
              ) {
                return null;
              }

              if (!item.href) {
                return null;
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        ) : null}

        {children}
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        {rightElements}

        {showAuthButton && !loading && (
          <>
            {session?.isLoggedIn ? (
              <Button onClick={() => setShowAuthModal?.(true)}>
                Mon compte
              </Button>
            ) : (
              <Button onClick={() => setShowAuthModal?.(true)}>
                Se connecter
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
