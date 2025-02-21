import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Athlete Free",
    description: "Basic plan for athletes.",
    benefits: [
      "Access to Player Stats",
      "100 MB monthly data",
      "Access to overall ranking",
      "1 video highlight upload",
      "Parental Notifications",
      "Can join 1 group",
      "Standard event ticketing",
    ],
    limitations: [
      "No access to advanced tracking or time-based data.",
      "No personalized recommendations.",
      "No advanced search filters.",
      "No access to exclusive webinars.",
      "Limited customer support.",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Athlete Premium",
    description: "Full access for athletes.",
    benefits: [
      "Unlimited data and tracking",
      "Advanced analytics",
      "Access to global rankings",
      "Up to 5 video highlights upload",
      "Coaching insights",
      "Global reach access",
      "Can join up to 10 groups",
      "Priority event ticketing",
      "Exclusive webinars",
      "Advanced search filters",
      "Personalized scouting recommendations",
    ],
    limitations: [
      "No third-party integrations for data exports.",
      "No automatic reports (future feature).",
    ],
    prices: {
      monthly: 15,
      yearly: 120,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_ATHLETE_PREMIUM_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_ATHLETE_PREMIUM_YEARLY_PLAN_ID,
    },
  },
  {
    title: "Recruiter Free",
    description: "Basic recruiter tools.",
    benefits: [
      "Access to Player Stats",
      "Manage up to 5 athletes",
      "100 MB monthly data",
      "Access to overall ranking",
      "3 video highlight views",
      "Parental Notifications",
      "Can join 1 group",
      "Standard event ticketing",
    ],
    limitations: [
      "Limited to one region (no global access).",
      "No personalized recommendations.",
      "No advanced search or detailed tracking.",
      "Limited customer support.",
      "Cannot manage more than 5 athletes per month.",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Recruiter Premium",
    description: "Full access for recruiters.",
    benefits: [
      "Manage up to 15 athletes",
      "Unlimited data and tracking",
      "Unlimited video highlight views",
      "Global reach access",
      "Can join up to 10 groups",
      "Priority event ticketing",
      "Exclusive webinars",
      "Advanced search filters",
    ],
    limitations: [
      "Limited to 15 athletes per month.",
      "No dedicated account manager.",
      "No professional tools for reporting or export.",
    ],
    prices: {
      monthly: 30,
      yearly: 300,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_RECRUITER_PREMIUM_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_RECRUITER_PREMIUM_YEARLY_PLAN_ID,
    },
  },
  // {
  //     title: "Business",
  //     description: "For Power Users",
  //     benefits: [
  //         "Unlimited posts",
  //         "Real-time analytics and reporting",
  //         "Access to all templates, including custom branding",
  //         "24/7 business customer support",
  //         "Personalized onboarding and account management.",
  //     ],
  //     limitations: [],
  //     prices: {
  //         monthly: 30,
  //         yearly: 300,
  //     },
  //     stripeIds: {
  //         monthly: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
  //         yearly: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
  //     },
  // },
];

export const plansColumns = [
  "starter",
  "pro",
  "business",
  "enterprise",
] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "Access to Player Stats",
    starter: true,
    pro: true,
    business: true,
    enterprise: "Custom",
    tooltip: "All plans provide access to basic player statistics.",
  },
  {
    feature: "Data Storage Limit",
    starter: "100 MB/month",
    pro: "Unlimited",
    business: "Unlimited",
    enterprise: "Unlimited",
    tooltip: "Free plans are limited to 100 MB of data storage per month.",
  },
  {
    feature: "Highlight Videos Upload",
    starter: "1 video/month",
    pro: "Up to 5 videos/month",
    business: "Unlimited",
    enterprise: "Unlimited",
    tooltip:
      "Free plans can upload 1 video per month. Premium plans offer higher limits.",
  },
  {
    feature: "Access to Rankings",
    starter: "Overall ranking",
    pro: "Advanced ranking",
    business: "Advanced ranking",
    enterprise: "Custom",
    tooltip:
      "Advanced ranking with more detailed insights is available for premium users.",
  },
  {
    feature: "Group Memberships",
    starter: "1 group",
    pro: "Up to 10 groups",
    business: "Unlimited groups",
    enterprise: "Unlimited groups",
    tooltip:
      "Premium plans allow joining multiple groups, enhancing networking capabilities.",
  },
  {
    feature: "Ticketing Access",
    starter: "Standard",
    pro: "Priority (1 week earlier)",
    business: "Priority (1 week earlier)",
    enterprise: "Priority (customizable)",
    tooltip:
      "Premium plans allow access to event ticketing one week earlier than public sales.",
  },
  {
    feature: "Parental Notifications",
    starter: true,
    pro: true,
    business: true,
    enterprise: true,
    tooltip:
      "Parents are notified about interactions between coaches and athletes.",
  },
  {
    feature: "Global Reach Access",
    starter: false,
    pro: true,
    business: true,
    enterprise: "Custom",
    tooltip:
      "Recruiters and athletes on premium plans can connect internationally.",
  },
  {
    feature: "Advanced Search Filters",
    starter: false,
    pro: true,
    business: true,
    enterprise: true,
    tooltip:
      "Filters for finding specific athletes or recruiters are available in premium plans.",
  },
  {
    feature: "Webinars and Live Sessions",
    starter: false,
    pro: true,
    business: true,
    enterprise: true,
    tooltip:
      "Monthly webinars and exclusive live sessions are accessible to premium users.",
  },
  {
    feature: "Athlete Recommendations",
    starter: false,
    pro: "Basic recommendations",
    business: "Personalized recommendations",
    enterprise: "Fully customized",
    tooltip:
      "Premium plans include more detailed and personalized scouting recommendations.",
  },
  {
    feature: "Support",
    starter: "Basic",
    pro: "Priority",
    business: "Priority (email & chat)",
    enterprise: "24/7 Support",
    tooltip: "Support improves significantly for premium and enterprise plans.",
  },
  {
    feature: "Athlete Management (Recruiter)",
    starter: "Up to 5 athletes/month",
    pro: "Up to 15 athletes/month",
    business: "Unlimited",
    enterprise: "Unlimited",
    tooltip: "Premium recruiter plans allow managing more athletes monthly.",
  },
];
