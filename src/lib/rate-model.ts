/** Six-factor Kenya freelance rate model.
 *  Source: Kenya_Freelance_Pricing_Report.docx (repo root), §5–§8.
 *  Predicted rate (KES/hr) = B × E × S × R ÷ P × L.
 *  Base rates and multipliers are the report's published coefficients
 *  (benchmarks compiled July 2026; USD/KES 129.23). Update cadence per §8.3. */

export type ClientMarket = "local" | "international";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "expert";
export type SkillTier = "generalist" | "specialist" | "in-demand" | "ai-ml";
export type ReputationTier = "none" | "early" | "established" | "well-regarded" | "certified";
export type Platform = "direct" | "upwork" | "freelancer" | "fiverr";
export type KenyaLocation = "nairobi" | "nairobi-suburbs" | "mombasa" | "kisumu-nakuru" | "rural";

/** Report §5.1 base-rate table, KES/hr. */
export const BASE_RATES = {
  "va-basic":            { label: "Virtual Assistant / Data Entry", local: 142,  international: 1550 },
  "content-writer":      { label: "Content Writer",                 local: 219,  international: 1939 },
  "social-media":        { label: "Social Media Manager",           local: 469,  international: 3231 },
  "graphic-designer":    { label: "Graphic Designer",               local: 444,  international: 5169 },
  "ux-ui-designer":      { label: "UX/UI Designer",                 local: 500,  international: 6462 },
  "digital-marketing":   { label: "Digital Marketing Specialist",   local: 438,  international: 3231 },
  "software-dev-junior": { label: "Software Developer (junior)",    local: 563,  international: 3877 },
  "software-dev-mid":    { label: "Software Developer (mid)",       local: 688,  international: 5169 },
  "software-dev-senior": { label: "Software Developer (senior)",    local: 1125, international: 7754 },
  "data-analyst-mid":    { label: "Data Analyst (mid)",             local: 563,  international: 5169 },
  "data-scientist":      { label: "Data Scientist / ML",            local: 1250, international: 9692 },
  "devops-cloud":        { label: "DevOps / Cloud Engineer",        local: 938,  international: 7754 },
  "ai-ml-engineer":      { label: "AI / ML Engineer",               local: 1250, international: 12923 },
  "cybersecurity":       { label: "Cybersecurity Specialist",       local: 1094, international: 16154 },
} as const;

export type RateModelRole = keyof typeof BASE_RATES;
export const RATE_MODEL_ROLES = Object.keys(BASE_RATES) as RateModelRole[];

/** Report §5.2. Exported: Market Insights derives seniority bands from it. */
export const EXPERIENCE_MULTIPLIERS: Record<ExperienceLevel, number> = {
  entry: 0.65, junior: 0.85, mid: 1.0, senior: 1.25, expert: 1.5,
};
const EXPERIENCE = EXPERIENCE_MULTIPLIERS;

/** Report §5.3 */
const SKILL: Record<SkillTier, number> = {
  generalist: 1.0, specialist: 1.2, "in-demand": 1.4, "ai-ml": 1.6,
};

/** Report §5.4 */
const REPUTATION: Record<ReputationTier, number> = {
  none: 0.9, early: 1.0, established: 1.1, "well-regarded": 1.2, certified: 1.3,
};

/** Report §5.5 — divisor: gross = net ÷ P. Goodturn takes no fee (direct). */
const PLATFORM: Record<Platform, number> = {
  direct: 1.0, upwork: 0.9, freelancer: 0.9, fiverr: 0.8,
};

/** Report §5.6 — local domestic market only. */
const LOCATION: Record<KenyaLocation, number> = {
  nairobi: 1.0, "nairobi-suburbs": 0.92, mombasa: 0.82, "kisumu-nakuru": 0.75, rural: 0.68,
};

/** Report §8.4 guard rail: 120% of the Toptal floor — KES 19,385/hr ($150). */
const RATE_CAP = 19385;

export type RateInputs = {
  role: RateModelRole;
  market: ClientMarket;
  experience: ExperienceLevel;
  skill: SkillTier;
  reputation: ReputationTier;
  platform: Platform;
  location: KenyaLocation;
};

export type RateBand = { low: number; suggested: number; high: number };

export function predictRate(inputs: RateInputs): RateBand {
  const b = BASE_RATES[inputs.role][inputs.market];
  const l = inputs.market === "local" ? LOCATION[inputs.location] : 1.0;
  const raw =
    (b * EXPERIENCE[inputs.experience] * SKILL[inputs.skill] * REPUTATION[inputs.reputation]) /
    PLATFORM[inputs.platform] * l;
  const suggested = Math.min(Math.round(raw), RATE_CAP);
  return {
    low: Math.round(suggested * 0.8),
    suggested,
    high: Math.round(suggested * 1.25),
  };
}

/** Report §6.2: Nairobi single-person monthly need KES 129,000–223,000 gross
 *  (cost base grossed up for 65% billable time). Midpoint 176,000. */
const FLOOR_MONTHLY_NEED = 176_000;

export function costFloorStatus(
  suggestedRate: number,
  billableHoursPerMonth: number
): { status: "green" | "amber" | "red"; monthly: number; floorMonthly: number } {
  const monthly = suggestedRate * billableHoursPerMonth;
  const status =
    monthly >= FLOOR_MONTHLY_NEED * 1.25 ? "green" : monthly >= FLOOR_MONTHLY_NEED ? "amber" : "red";
  return { status, monthly, floorMonthly: FLOOR_MONTHLY_NEED };
}
