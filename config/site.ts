import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "PlayerConnect",
  description:
    "Stats, vidéos et calendrier de match des athlètes du secondaire, du cégep et de l'université, au même endroit pour les recruteurs.",
  url: site_url,
  ogImage: `${site_url}/og.jpg`,
  links: {
    github: "https://github.com/cortex225/playerConnect",
  },
  mailSupport: "player.connect.ad@gmail.com",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Plateforme",
    items: [
      { title: "Pour les athlètes", href: "/#athletes" },
      { title: "Pour les recruteurs", href: "/#recruteurs" },
      { title: "Tarifs", href: "/pricing" },
    ],
  },
  {
    title: "Compte",
    items: [
      { title: "Se connecter", href: "/auth/login" },
      { title: "Créer un compte", href: "/auth/register" },
    ],
  },
];
