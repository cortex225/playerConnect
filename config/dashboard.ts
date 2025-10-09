import { DashboardConfig } from "types";





export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Landing",
      href: "/",
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
      href: "/dashboard/athlete/athletes",
      icon: "users",
      roles: ["ATHLETE"],
    },
    {
      title: "Athletes",
      href: "/dashboard/recruiter/athletes",
      icon: "users",
      roles: ["RECRUITER"],
    },
    {
      title: "Médias",
      href: "/dashboard/athlete/media",
      icon: "media",
      roles: ["ATHLETE"],
    },
    {
      title: "Messages",
      href: "/dashboard/athlete/messages",
      icon: "messages_square",
      roles: ["ATHLETE"],
    },
    {
      title: "Messages",
      href: "/dashboard/recruiter/messages",
      icon: "messages_square",
      roles: ["RECRUITER"],
    },
    {
      title: "Calendar",
      href: "/dashboard/athlete/calendar",
      icon: "calendar_days",
      roles: ["ATHLETE"],
    },
    {
      title: "Calendar",
      href: "/dashboard/recruiter/calendar",
      icon: "calendar_days",
      roles: ["RECRUITER"],
    },
    {
      title: "Billing",
      href: "/dashboard/athlete/billing",
      icon: "billing",
      roles: ["ATHLETE"],
    },
    {
      title: "Billing",
      href: "/dashboard/recruiter/billing",
      icon: "billing",
      roles: ["RECRUITER"],
    },
    {
      title: "Settings",
      href: "/dashboard/athlete/settings",
      icon: "settings",
      roles: ["ATHLETE"],
    },
    {
      title: "Settings",
      href: "/dashboard/recruiter/settings",
      icon: "settings",
      roles: ["RECRUITER"],
    },
  ],
};