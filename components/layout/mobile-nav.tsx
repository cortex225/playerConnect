"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { SidebarNavItem } from "@/types/nav";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface NavMobileProps {
  items: SidebarNavItem[];
  userRole?: UserRole | string;
}

export function NavMobile({ items, userRole }: NavMobileProps) {
  const [open, setOpen] = useState(false);
  const segment = useSelectedLayoutSegment();

  if (!items?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = item.href
          ? segment === item.href.split("/")[1]
          : false;

        // Vérifier si l'utilisateur a le rôle requis pour voir cet élément
        if (item.roles && userRole && !item.roles.includes(userRole as UserRole)) {
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
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline",
              {
                "bg-muted": isActive,
              },
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
