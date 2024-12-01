import { DashboardConfig } from "types";

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "layout_dashboard",
      roles: ["ADMIN", "ATHLETE", "RECRUITER"], // Disponible pour tous les rôles
    },
    {
      title: "Athletes",
      href: "/dashboard/recruiter/athletes",
      icon: "users",
      roles: ["ADMIN", "RECRUITER"],
    },
    {
      title: "Prospects",
      href: "/dashboard/recruiter/prospects",
      icon: "star",
      roles: ["ADMIN", "RECRUITER"],
    },
    {
      title: "Applications",
      href: "/dashboard/recruiter/applications",
      icon: "file_text",
      roles: ["ATHLETE", "RECRUITER"], // Non disponible pour les administrateurs
    },
    {
      title: "Messages",
      href: "/dashboard/recruiter/messages",
      icon: "calendar_days",
      roles: ["ATHLETE", "RECRUITER"], // Non disponible pour les administrateurs
    },
    {
      title: "Calendar",
      href: "/dashboard/recruiter/calendar",
      icon: "calendar_days",
      roles: ["ATHLETE", "RECRUITER"], // Non disponible pour les administrateurs
    },

    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: "bar_chart_2",
      roles: ["ATHLETE", "RECRUITER"], // Non disponible pour les administrateurs
    },

    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
      roles: ["ADMIN", "RECRUITER"], // Accessible uniquement aux recruteurs et admins
    },
    {
      title: "Help Center",
      href: "/dashboard/help-center",
      icon: "circle_help",
      roles: ["ADMIN", "ATHLETE", "RECRUITER"], // Disponible pour tous
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
      roles: ["ADMIN", "ATHLETE", "RECRUITER"], // Pas pour les recruteurs
    },
  ],
};
