import {SidebarNavItem, SiteConfig} from "types";
import {env} from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
    name: "Player Connect",
    description:
        "PlayerConnect is a groundbreaking sports platform that connects players, coaches, and media professionals worldwide. Designed to meet the demands of today’s digital sports landscape," +
        " PlayerConnect creates a secure, efficient, and transparent ecosystem for streamlined communication and engagement. With account options for Players, Coaches, and Media, our platform " +
        "fosters meaningful interactions that enhance connections and insights among key figures in the sports industry.",
    url: site_url,
    ogImage: `${site_url}/og.jpg`,
    links: {
        twitter: "https://twitter.com/miickasmt",
        github: "https://github.com/mickasmt/next-saas-stripe-starter",
        instagram: "https://instagram.com/mickasmt",
        facebook: "https://facebook.com/mickasmt",
    },
    mailSupport: "player.connect.ad@gmail.com",
};

export const footerLinks: SidebarNavItem[] = [
    {
        title: "Company",
        items: [
            {title: "About", href: "#"},
            {title: "Enterprise", href: "#"},
            {title: "Terms", href: "/terms"},
            {title: "Privacy", href: "/privacy"},
        ],
    },
    {
        title: "Product",
        items: [
            {title: "Security", href: "#"},
            {title: "Customization", href: "#"},
            {title: "Customers", href: "#"},
            {title: "Changelog", href: "#"},
        ],
    },
    {
        title: "Docs",
        items: [
            {title: "Introduction", href: "#"},
            {title: "Installation", href: "#"},
            {title: "Components", href: "#"},
            {title: "Code Blocks", href: "#"},
        ],
    },
];
