"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

interface NavMobileProps {
  items: NavItem[];
}

export function NavMobile({ items }: NavMobileProps) {
  const [open, setOpen] = useState(false);
  const segment = useSelectedLayoutSegment();

  if (!items?.length) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left font-urban text-lg font-bold">
            Player Connect
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const isActive = item.href
              ? segment === item.href.split("/")[1]
              : false;

            return (
              <Link
                key={item.title}
                href={item.disabled ? "#" : item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  item.disabled && "cursor-not-allowed opacity-60",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t p-4">
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className={cn(
              "flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            )}
          >
            Se connecter
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
