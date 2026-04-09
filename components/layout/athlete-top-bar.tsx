"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AthleteTopBarProps {
  name: string | null;
  image: string | null;
  sportIcon: string;
  level: number;
  xp: number;
  xpProgress: number;
  streak: number;
}

export function AthleteTopBar({
  name,
  image,
  sportIcon,
  level,
  xp,
  xpProgress,
  streak,
}: AthleteTopBarProps) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "?";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Link href="/dashboard/athlete" className="shrink-0">
          <Image
            src="/images/logo-1.png"
            width={32}
            height={32}
            alt="Player Connect"
            className="size-8"
          />
        </Link>
        <Avatar className="size-9 shrink-0 ring-2 ring-primary/30 ring-offset-1 ring-offset-background">
          <AvatarImage src={image || ""} alt={name || ""} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-xs font-bold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-urban text-sm font-bold">{name}</h1>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{sportIcon}</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
              Niv. {level}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{xp} XP</span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1">
          <Flame className="size-3.5 text-orange-500" />
          <span className="text-xs font-bold text-orange-500">{streak}</span>
        </div>
      </div>
      <div className="px-4 pb-2">
        <Progress value={xpProgress} className="h-1" />
      </div>
    </header>
  );
}
