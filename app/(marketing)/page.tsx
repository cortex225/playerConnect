import { cookies } from "next/headers";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { RoleDialogs } from "@/components/dialogs/role-dialogs";
import CTASection from "@/components/sections/cta-section";
import FeaturesNew from "@/components/sections/features-new";
import HeroLandingNew from "@/components/sections/hero-landing-new";
import HowItWorks from "@/components/sections/how-it-works";
import TestimonialsNew from "@/components/sections/testimonials-new";
import TopPlayers from "@/components/sections/top-players";

export const metadata: Metadata = {
  title: "PlayerConnect - Connectez le Talent aux Opportunités Sportives",
  description:
    "Plateforme professionnelle pour athlètes, recruteurs et médias sportifs. Créez votre profil, découvrez des talents, suivez les performances avec des analytics avancées. Rejoignez plus de 10 000 professionnels du sport.",
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
    locale: "fr_FR",
    url: siteConfig.url,
    title: "PlayerConnect - Connectez le Talent aux Opportunités Sportives",
    description:
      "La plateforme qui réunit athlètes, recruteurs et médias pour construire l'avenir du sport professionnel.",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "PlayerConnect - Plateforme Sportive Professionnelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayerConnect - Connectez le Talent aux Opportunités Sportives",
    description:
      "Plateforme professionnelle pour athlètes, recruteurs et médias sportifs.",
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
      <HeroLandingNew />
      <FeaturesNew />
      <TopPlayers />
      <HowItWorks />
      <TestimonialsNew />
      <CTASection />
    </>
  );
}
