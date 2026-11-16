import * as React from "react";
import Link from "next/link";

import { footerLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container grid max-w-6xl gap-10 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl uppercase">{siteConfig.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
        {footerLinks.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <p className="text-sm font-semibold">{section.title}</p>
            <ul className="mt-4 space-y-3">
              {section.items?.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href ?? "#"}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t">
        <div className="container flex max-w-6xl items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Conçu et développé par{" "}
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Jean-Luc Gouaho
            </Link>
          </p>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
}
