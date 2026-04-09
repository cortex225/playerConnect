import { cn } from "@/lib/utils";

// Sport emoji icons as simple components
export const SportIcons: Record<string, React.FC<{ className?: string }>> = {
  BASKETBALL: ({ className }) => (
    <span className={cn("text-base", className)} role="img" aria-label="Basketball">🏀</span>
  ),
  SOCCER: ({ className }) => (
    <span className={cn("text-base", className)} role="img" aria-label="Soccer">⚽</span>
  ),
  FOOTBALL: ({ className }) => (
    <span className={cn("text-base", className)} role="img" aria-label="Football">🏈</span>
  ),
  RUGBY: ({ className }) => (
    <span className={cn("text-base", className)} role="img" aria-label="Rugby">🏉</span>
  ),
};

export const sportColors: Record<string, string> = {
  BASKETBALL: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  SOCCER: "bg-green-500/10 text-green-600 border-green-500/20",
  FOOTBALL: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  RUGBY: "bg-red-500/10 text-red-600 border-red-500/20",
};

export const sportGradients: Record<string, string> = {
  BASKETBALL: "from-orange-500 to-orange-600",
  SOCCER: "from-green-500 to-emerald-600",
  FOOTBALL: "from-amber-500 to-amber-600",
  RUGBY: "from-red-500 to-red-600",
};

export function getSportIcon(sportName: string | null | undefined): string {
  const icons: Record<string, string> = {
    BASKETBALL: "🏀",
    SOCCER: "⚽",
    FOOTBALL: "🏈",
    RUGBY: "🏉",
  };
  return icons[sportName || ""] || "🏅";
}

export function getSportColor(sportName: string | null | undefined): string {
  return sportColors[sportName || ""] || "bg-muted text-muted-foreground";
}

export function getSportGradient(sportName: string | null | undefined): string {
  return sportGradients[sportName || ""] || "from-primary to-purple-600";
}
