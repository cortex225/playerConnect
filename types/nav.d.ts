import { type Role } from "@/lib/constants";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  label?: string;
  roles?: Role[];
};

export type SidebarNavItem = NavItem & {
  items?: NavItem[];
};

export type MainNavItem = NavItem;
