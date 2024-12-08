"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSelectedLayoutSegment } from "next/navigation";

import { adminConfig } from "@/config/admin";
import { dashboardConfig } from "@/config/dashboard";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/shared/icons";
import { ModeToggle } from "./mode-toggle";
import { SidebarNavItem, UserRole } from "@/types/nav";
import Link from "next/link";
import React from "react";

interface MobileNavProps {
  items?: SidebarNavItem[];
}

export function NavMobile({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const selectedLayout = useSelectedLayoutSegment();
  const userRole = session.data?.user?.role as UserRole;

  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  // Déterminer les items de navigation en fonction du rôle
  const navItems = React.useMemo(() => {
    if (!userRole) return [];
    
    // Si des items sont fournis via props, les utiliser
    if (items) return items;

    // Sinon, utiliser les items par défaut en fonction du rôle
    return userRole === "ADMIN" 
      ? adminConfig.sidebarNav 
      : dashboardConfig.sidebarNav;
  }, [items, userRole]);

  // Filtrer les items en fonction du rôle
  const filteredItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Icons.ellipsis className="size-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {filteredItems.map((item, index) => (
              <Link
                key={index}
                href={item.disabled || !item.href ? "#" : item.href}
                className={cn(
                  "text-foreground/70 transition-colors hover:text-foreground",
                  item.disabled && "cursor-not-allowed opacity-60",
                  item.href && item.href.includes(selectedLayout?.toString() || "")
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className="absolute bottom-4 left-6">
          <ModeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
