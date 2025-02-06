import { Loader2, LucideProps, type Icon as LucideIcon } from "lucide-react";

export type Icon = typeof LucideIcon;

export const Icons = {
  spinner: Loader2,
} as const;
