"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROLES } from "@/lib/constants";
import type { UserSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardNavProps {
  items: {
    href: string;
    title: string;
    roles?: string[];
  }[];
  userRole?: string;
}

export function DashboardNav({ items, userRole }: DashboardNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  // Afficher un skeleton pendant le chargement
  if (!userRole) {
    return (
      <nav className="grid items-start gap-2">
        {items.map((item, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </nav>
    );
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        // Vérifier si l'utilisateur a le rôle requis pour voir cet élément
        if (item.roles && !item.roles.includes(userRole)) {
          return null;
        }

        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
              isActive
                ? "bg-muted font-medium hover:bg-muted"
                : "hover:bg-muted/50",
              "justify-start transition-colors",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
