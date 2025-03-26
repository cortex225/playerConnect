"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROLES } from "@/lib/constants";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface DashboardNavProps {
  items: {
    href: string;
    title: string;
    roles?: string[];
  }[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname();
  const { session } = useSession();

  if (!items?.length || !session) {
    return null;
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        // Vérifier si l'utilisateur a le rôle requis pour voir cet élément
        if (item.roles && !item.roles.includes(session.role)) {
          return null;
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
