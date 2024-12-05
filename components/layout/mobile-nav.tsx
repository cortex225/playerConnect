"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

import { dashboardConfig } from "@/config/dashboard";
import { adminConfig } from "@/config/admin";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import { ModeToggle } from "./mode-toggle";

export function NavMobile() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const selectedLayout = useSelectedLayoutSegment();

  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  // Filtrer les items en fonction du rôle de l'utilisateur
  const navItems = React.useMemo(() => {
    const userRole = session?.user?.role;
    if (!userRole) return [];

    const items = userRole === "ADMIN" 
      ? adminConfig.sidebarNav
      : dashboardConfig.sidebarNav;

    // Ne retourner que les items correspondant au rôle de l'utilisateur
    return items.filter(item => 
      !item.roles || item.roles.includes(userRole)
    );
  }, [session?.user?.role]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed right-2 top-2.5 z-50 rounded-full p-2 transition-colors duration-200 hover:bg-muted focus:outline-none active:bg-muted md:hidden",
          open && "hover:bg-muted active:bg-muted"
        )}
      >
        {open ? (
          <X className="size-5 text-muted-foreground" />
        ) : (
          <Menu className="size-5 text-muted-foreground" />
        )}
      </button>

      <nav
        className={cn(
          "fixed inset-0 z-20 hidden w-full overflow-auto bg-background px-5 py-16 lg:hidden",
          open && "block"
        )}
      >
        {/* Navigation basée sur le rôle de l'utilisateur connecté */}
        <ul className="grid divide-y divide-muted">
          {navItems.map((item, index) => (
            <li key={index} className="py-3">
              <Link
                href={item.href || "#"}
                onClick={() => setOpen(false)}
                className="flex w-full items-center font-medium capitalize"
              >
                {item.icon && (
                  <span className="mr-2">
                    {Icons[item.icon] && 
                      React.createElement(Icons[item.icon], {
                        className: "size-5"
                      })
                    }
                  </span>
                )}
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer avec GitHub et Mode Toggle */}
        <div className="mt-5 flex items-center justify-end space-x-4">
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <Icons.gitHub className="size-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <ModeToggle />
        </div>
      </nav>

      {/* Overlay pour fermer le menu */}
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
