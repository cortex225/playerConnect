"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/shared/brand-logo";

interface AthleteTopBarProps {
  name: string | null;
  image: string | null;
  sportIcon?: string;
  level?: number;
  xp?: number;
  xpProgress?: number;
  streak?: number;
  basePath?: string;
}

// Barre du haut de l'app mobile (athlète et recruteur).
export function AthleteTopBar({
  name,
  image,
  level,
  xpProgress,
  basePath = "/dashboard/athlete",
}: AthleteTopBarProps) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 md:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <Link href={basePath} aria-label="Accueil PlayerConnect">
          <BrandLogo withName={false} />
        </Link>
        <div className="flex-1" />
        <Link
          href={`${basePath}/messages`}
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications et messages"
        >
          <Bell className="size-5" aria-hidden />
        </Link>
        <Link
          href={`${basePath}/settings`}
          className={level ? "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3" : "flex items-center rounded-full"}
          aria-label={level ? `Mon profil, niveau ${level}` : "Mon profil"}
        >
          <Avatar className="size-8">
            <AvatarImage src={image || ""} alt="" />
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {level ? <span className="text-xs font-semibold">Niv. {level}</span> : null}
        </Link>
      </div>
      {xpProgress !== undefined && (
      <div
        className="h-0.5 bg-muted"
        role="progressbar"
        aria-label="Progression vers le niveau suivant"
        aria-valuenow={Math.round(xpProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-brand" style={{ width: `${xpProgress}%` }} />
      </div>
      )}
    </header>
  );
}
