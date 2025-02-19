import { User } from "@prisma/client";

import { Icons } from "@/components/shared/icons";

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
export type DashboardRecruiterConfig = {
  recruiterStats: recruiterStatsItem[];
};

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

export type SportType = "BASKETBALL" | "SOCCER" | "FOOTBALL" | "RUGBY";
export type CategoryLevel = "BENJAMIN" | "CADET" | "JUVENILE" | "SENIOR";
export type PositionType = string;

export type KPI = {
  id: number;
  name: string;
  value: number;
  weight: number;
  positionId: string;
  performanceId: number;
};

export type Performance = {
  id: number;
  athleteId: number;
  positionId: string;
  score: number;
  date: Date;
  position: {
    name: string;
    id: string;
    sportId: string;
  } | null;
  KPI: KPI[];
};

export type Athlete = {
  id: number;
  userId: string;
  gender: string | null;
  age: number | null;
  city: string | null;
  height: number | null;
  weight: number | null;
  dominantHand: string | null;
  dominantFoot: string | null;
  programType: string | null;
  categoryId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    password?: string | null;
    role: UserRole;
  };
  sport: {
    id: string;
    name: SportType;
  } | null;
  category: {
    name: CategoryLevel;
  } | null;
  performances: Performance[];
  positions?: { position: { id: string; name: string } }[];
};

export type PerformanceFormValues = {
  date: Date;
  positionId: string;
  stats: Array<{
    key: string;
    value: number;
  }>;
};

export type PerformanceFormProps = {
  positions: Array<{ 
    id: string; 
    name: string;
    sportId: string;
  }>;
  sportType: SportType;
  athleteId: number;
};

export type SportStats = Record<string, Array<{ key: string; label: string }>>;
