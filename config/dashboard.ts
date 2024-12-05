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
      href: "/dashboard/admin",
      icon: "layout_dashboard",
      roles: ["ADMIN"],
    },
    {
      title: "Dashboard",
      href: "/dashboard/athlete",
      icon: "layout_dashboard",
      roles: ["ATHLETE"],
    },
    {
      title: "Dashboard",
      href: "/dashboard/recruiter",
      icon: "layout_dashboard",
      roles: ["RECRUITER"],
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
      href: "/dashboard/athlete/applications",
      icon: "file_text",
      roles: ["ATHLETE"],
    },
    {
      title: "Recruiter Applications",
      href: "/dashboard/recruiter/applications",
      icon: "file_text",
      roles: ["RECRUITER"],
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: "messages_square",
      roles: ["ATHLETE", "RECRUITER"],
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: "calendar_days",
      roles: ["ATHLETE", "RECRUITER"],
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: "bar_chart_2",
      roles: ["ATHLETE", "RECRUITER"],
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
      roles: ["ADMIN", "RECRUITER"],
    },
    {
      title: "Help Center",
      href: "/dashboard/help",
      icon: "circle_help",
      roles: ["ADMIN", "ATHLETE", "RECRUITER"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
      roles: ["ADMIN", "ATHLETE", "RECRUITER"],
    },
  ],
};
