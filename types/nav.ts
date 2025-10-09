export type UserRole = "ADMIN" | "ATHLETE" | "RECRUITER" | "USER";

export interface SidebarNavItem {
  title: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  roles?: UserRole[];
}
