/** Public market benchmark data for the Find Work -> Market Insights view.
 *  Source: Kenya_Freelance_Pricing_Report.docx SS3-S4, S9 (Glassdoor KE,
 *  BrighterMonday, Arc.dev, Lemon.io, Edstellar, MaxisHR - July 2026).
 *  HARD RULE: public data only. Nothing in this module may read Goodturn
 *  platform data - no prisma, no job counts, no platform medians. */

import { BASE_RATES, EXPERIENCE_MULTIPLIERS, type RateModelRole } from "@/lib/rate-model";

export type TrendTone = "hot" | "rising" | "steady" | "pressure";

export type RoleInsight = {
  role: RateModelRole;
  /** International rate band shown as published (USD/hr). */
  intlUsd: string;
  trend?: { label: string; tone: TrendTone; source: string };
  learnHref: string;
};

export type IndustryGroup = { industry: string; roles: RoleInsight[] };

export function seniorityBands(role: RateModelRole): { entry: number; mid: number; senior: number } {
  const base = BASE_RATES[role].local;
  return {
    entry: Math.round(base * EXPERIENCE_MULTIPLIERS.entry),
    mid: Math.round(base * EXPERIENCE_MULTIPLIERS.mid),
    senior: Math.round(base * EXPERIENCE_MULTIPLIERS.senior),
  };
}

export const MARKET_INSIGHTS: IndustryGroup[] = [
  {
    industry: "Admin & Support",
    roles: [
      {
        role: "va-basic",
        intlUsd: "$12-$25/hr",
        trend: {
          label: "High supply - competitive entry tier",
          tone: "pressure",
          source: "KenyaHowTo, Jun 2026: youth unemployment above 67% pressures entry rates",
        },
        learnHref: "/learn?topic=virtual-assistance",
      },
    ],
  },
  {
    industry: "Creative & Content",
    roles: [
      { role: "content-writer", intlUsd: "$10-$25/hr", learnHref: "/learn?topic=content-writing" },
      { role: "graphic-designer", intlUsd: "$30-$50/hr", learnHref: "/learn?topic=graphic-design" },
      {
        role: "ux-ui-designer",
        intlUsd: "$40-$60/hr",
        trend: {
          label: "International premium 5-8x local",
          tone: "rising",
          source: "AfricaCarrieres / AjiraNext design benchmarks 2026",
        },
        learnHref: "/learn?topic=ux-ui-design",
      },
      { role: "social-media", intlUsd: "$25-$40/hr", learnHref: "/learn?topic=social-media" },
    ],
  },
  {
    industry: "Technology",
    roles: [
      { role: "software-dev-junior", intlUsd: "$15-$25/hr", learnHref: "/learn?topic=software-development" },
      {
        role: "software-dev-mid",
        intlUsd: "$25-$50/hr",
        trend: {
          label: "56% of Kenyan developers freelance",
          tone: "steady",
          source: "TechTrends Kenya 2026",
        },
        learnHref: "/learn?topic=software-development",
      },
      {
        role: "software-dev-senior",
        intlUsd: "$50-$100+/hr",
        trend: {
          label: "48% YoY growth in Kenya remote roles",
          tone: "rising",
          source: "Andela Workforce Report 2026",
        },
        learnHref: "/learn?topic=software-development",
      },
      {
        role: "devops-cloud",
        intlUsd: "$40-$80/hr",
        trend: {
          label: "Shortage - firms search weeks to fill",
          tone: "hot",
          source: "Edstellar Kenya 2026 / BrighterMonday",
        },
        learnHref: "/learn?topic=devops-cloud",
      },
      {
        role: "ai-ml-engineer",
        intlUsd: "$60-$150/hr",
        trend: {
          label: "43% of firms report surging AI-skill demand",
          tone: "hot",
          source: "BrighterMonday via Edstellar, Jul 2026",
        },
        learnHref: "/learn?topic=ai-ml",
      },
      {
        role: "cybersecurity",
        intlUsd: "$80-$160/hr",
        trend: {
          label: "20-35% premium over general software",
          tone: "hot",
          source: "BrighterMonday 2024 via AscendurePro, Apr 2026",
        },
        learnHref: "/learn?topic=cybersecurity",
      },
    ],
  },
  {
    industry: "Data & Analytics",
    roles: [
      { role: "data-analyst-mid", intlUsd: "$40-$64/hr", learnHref: "/learn?topic=data-analysis" },
      {
        role: "data-scientist",
        intlUsd: "$50-$100/hr",
        trend: {
          label: "20-35% premium over general software",
          tone: "rising",
          source: "BrighterMonday via AscendurePro, Apr 2026",
        },
        learnHref: "/learn?topic=data-science",
      },
    ],
  },
  {
    industry: "Digital Marketing",
    roles: [
      {
        role: "digital-marketing",
        intlUsd: "$15-$30/hr",
        trend: {
          label: "BPO sector 40,000+ jobs, $1B by 2030",
          tone: "rising",
          source: "Edstellar Kenya 2026",
        },
        learnHref: "/learn?topic=digital-marketing",
      },
    ],
  },
];

export const INSIGHTS_CAPTION =
  "Public market data · July 2026 · Glassdoor Kenya, BrighterMonday, Arc.dev, Lemon.io, Edstellar, MaxisHR. Not Goodturn pricing — rates shown are market benchmarks to help you decide what to apply for and what to learn.";
