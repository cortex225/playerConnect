import {User} from "@prisma/client";

import {Icons} from "@/components/shared/icons";

export type NavItem = {
    title: string;
    href: string;
    disabled?: boolean;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    roles?: Array<"ADMIN" | "ATHLETE" | "RECRUITER">;
} & (
    | {
    href: string;
    items?: never;
}
    | {
    href?: string;
    items: NavLink[];
}
    );

export type SiteConfig = {
    name: string;
    description: string;
    url: string;
    ogImage: string;
    mailSupport: string;
    links: {
        twitter: string;
        github: string;
        instagram?: string;
        facebook?: string;
    };
};

export type DocsConfig = {
    mainNav: MainNavItem[];
    sidebarNav: SidebarNavItem[];
};

export type MarketingConfig = {
    mainNav: MainNavItem[];
};

export type DashboardConfig = {
    mainNav: MainNavItem[];
    sidebarNav: SidebarNavItem[];
};
export  type  DashboardRecruiterConfig = {
    recruiterStats: recruiterStatsItem[];
}

export type SubscriptionPlan = {
    title: string;
    description: string;
    benefits: string[];
    limitations: string[];
    prices: {
        monthly: number;
        yearly: number;
    };
    stripeIds: {
        monthly: string | null;
        yearly: string | null;
    };
};

export type UserSubscriptionPlan = SubscriptionPlan &
    Pick<User, "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"> & {
    stripeCurrentPeriodEnd: number;
    isPaid: boolean;
    interval: "month" | "year" | null;
    isCanceled?: boolean;
};

export type InfoList = {
    icon: keyof typeof Icons;
    title: string;
    description: string;
};

export type InfoLdg = {
    title: string;
    image: string;
    description: string;
    list: InfoList[];
};

// compare plans
export type ColumnType = string | boolean | null;
export type PlansRow = { feature: string; tooltip?: string } & {
    [key in (typeof plansColumns)[number]]: ColumnType;
};



export type Athlete = {
    id: number;
    name: string | null;
    email: string | null;
    image: string | null;
    sport: string | null;
    category: string | null;
    bestPerformance?: {
        score: number;
        date: Date;
        position: string | null;
        KPIs: Array<{
            id: number;
            name: string;
            value: number;
        }>;
    } | null;
};