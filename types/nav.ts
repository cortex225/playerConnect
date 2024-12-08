export type UserRole = "ADMIN" | "ATHLETE" | "RECRUITER";

export interface SidebarNavItem {
  title: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  roles?: UserRole[];
}
