"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { SidebarNavItem } from "types";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

interface DashboardNavProps {
  items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname();
  const { data: session } = useSession();

  // Récupération sécurisée du rôle
  const userRole = session?.user?.role as
    | "ADMIN"
    | "ATHLETE"
    | "RECRUITER"
    | undefined;

  if (!items?.length || !userRole) {
    return null; // Rien à afficher si la liste est vide ou si le rôle est indéfini
  }

  return (
    <nav className="sticky top-20 grid items-start gap-2 space-y-4 rounded-2xl border px-1 py-4">
      {items
        .filter((item) => !item.roles || item.roles.includes(userRole)) // Filtrage par rôle
        .map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"]; // Fallback pour l'icône
          return (
            <Link key={index} href={item.href || "#"}>
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-accent-foreground",
                  path === item.href ? "bg-muted" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <Icon className="mr-2 size-5" />
                <span>{item.title}</span>
              </span>
            </Link>
          );
        })}
    </nav>
  );
}
