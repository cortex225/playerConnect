import { cookies } from "next/headers";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { RoleDialogs } from "@/components/dialogs/role-dialogs";
import { LandingHero } from "@/components/sections/landing-hero";
import { LandingRoles } from "@/components/sections/landing-roles";
import { LandingCta, LandingSafety } from "@/components/sections/landing-safety";
import TopPlayers from "@/components/sections/top-players";

export const metadata: Metadata = {
  title: "PlayerConnect, le profil sportif que les recruteurs consultent",
  description:
    "Stats, vidéos et calendrier de match des athlètes du secondaire, du cégep et de l'université, au même endroit. Les recruteurs comparent les profils et écrivent directement, avec un encadrement prévu pour les mineurs.",
  keywords: [
    "recrutement sportif",
    "athlètes professionnels",
    "plateforme sportive",
    "analytics sportives",
    "carrière sportive",
    "recruteurs sportifs",
    "réseau professionnel sport",
    "performances athlétiques",
    "scouting",
    "talents sportifs",
  ],
  authors: [{ name: "PlayerConnect" }],
  creator: "PlayerConnect",
  publisher: "PlayerConnect",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: siteConfig.url,
    title: "PlayerConnect, le profil sportif que les recruteurs consultent",
    description:
      "Stats, vidéos et calendrier de match des athlètes, au même endroit pour les recruteurs.",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "PlayerConnect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayerConnect, le profil sportif que les recruteurs consultent",
    description:
      "Stats, vidéos et calendrier de match des athlètes, au même endroit pour les recruteurs.",
    images: [siteConfig.ogImage],
    creator: "@playerconnect",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("selectedRole")?.value;

  return (
    <>
      <RoleDialogs roleCookie={roleCookie} />
      <LandingHero />
      <LandingRoles />
      <TopPlayers />
      <LandingSafety />
      <LandingCta />
    </>
  );
}
