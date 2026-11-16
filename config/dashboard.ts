import { DashboardConfig } from "types";





export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Retour au site",
      href: "/",
    },
  ],
  sidebarNav: [
    {
      title: "Ma fiche",
      href: "/dashboard/athlete",
      icon: "layout_dashboard",
      roles: ["ATHLETE"],
    },
    {
      title: "Tableau de bord",
      href: "/dashboard/recruiter",
      icon: "layout_dashboard",
      roles: ["RECRUITER"],
    },
    {
      title: "Athlètes",
      href: "/dashboard/athlete/athletes",
      icon: "users",
      roles: ["ATHLETE"],
    },
    {
      title: "Athlètes",
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
      title: "Calendrier",
      href: "/dashboard/athlete/calendar",
      icon: "calendar_days",
      roles: ["ATHLETE"],
    },
    {
      title: "Calendrier",
      href: "/dashboard/recruiter/calendar",
      icon: "calendar_days",
      roles: ["RECRUITER"],
    },
    {
      title: "Abonnement",
      href: "/dashboard/athlete/billing",
      icon: "billing",
      roles: ["ATHLETE"],
    },
    {
      title: "Abonnement",
      href: "/dashboard/recruiter/billing",
      icon: "billing",
      roles: ["RECRUITER"],
    },
    {
      title: "Profil et réglages",
      href: "/dashboard/athlete/settings",
      icon: "settings",
      roles: ["ATHLETE"],
    },
    {
      title: "Profil et réglages",
      href: "/dashboard/recruiter/settings",
      icon: "settings",
      roles: ["RECRUITER"],
    },
  ],
};