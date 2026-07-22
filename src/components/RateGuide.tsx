"use client";

import { useState } from "react";
import {
  predictRate,
  costFloorStatus,
  BASE_RATES,
  RATE_MODEL_ROLES,
  type RateModelRole,
  type ClientMarket,
  type ExperienceLevel,
  type SkillTier,
  type ReputationTier,
  type KenyaLocation,
} from "@/lib/rate-model";
import { formatKES, formatKESRate } from "@/lib/currency";

const selectCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100";

const EXPERIENCE_OPTIONS: [ExperienceLevel, string][] = [
  ["entry", "Entry (0–1 years)"],
  ["junior", "Junior (1–3 years)"],
  ["mid", "Mid (3–6 years)"],
  ["senior", "Senior (6–10 years)"],
  ["expert", "Expert (10+ years)"],
];
const SKILL_OPTIONS: [SkillTier, string][] = [
  ["generalist", "Generalist"],
  ["specialist", "Specialist (advanced niche skills)"],
  ["in-demand", "In-demand tech (cloud, DevOps, mobile)"],
  ["ai-ml", "AI / ML / GenAI"],
];
const REPUTATION_OPTIONS: [ReputationTier, string][] = [
  ["none", "No reviews yet"],
  ["early", "1–10 reviews"],
  ["established", "11–50 reviews"],
  ["well-regarded", "50+ reviews, 4.8+ rating"],
  ["certified", "Platform-certified (Top Rated / Andela / Toptal)"],
];
const LOCATION_OPTIONS: [KenyaLocation, string][] = [
  ["nairobi", "Nairobi (CBD / Westlands / Kilimani)"],
  ["nairobi-suburbs", "Nairobi suburbs"],
  ["mombasa", "Mombasa"],
  ["kisumu-nakuru", "Kisumu / Nakuru / other major town"],
  ["rural", "Rural Kenya"],
];

const FLOOR_ADVICE: Record<"amber" | "red", string> = {
  amber:
    "This is close to the minimum a Nairobi freelancer needs to cover living costs, taxes, and savings. A specialisation or more reviews would give you headroom.",
  red:
    "Below a sustainable income for full-time freelancing in Kenya. The market data suggests: target international clients, specialise to command a premium, or build seniority — local rates in this tier cannot cover a Nairobi cost base.",
};

export default function RateGuide() {
  const [role, setRole] = useState<RateModelRole>("content-writer");
  const [market, setMarket] = useState<ClientMarket>("local");
  const [experience, setExperience] = useState<ExperienceLevel>("mid");
  const [skill, setSkill] = useState<SkillTier>("generalist");
  const [reputation, setReputation] = useState<ReputationTier>("early");
  const [location, setLocation] = useState<KenyaLocation>("nairobi");
  const [hours, setHours] = useState(120);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const band = predictRate({ role, market, experience, skill, reputation, platform: "direct", location });
  const floor = costFloorStatus(band.suggested, hours);

  const floorColor =
    floor.status === "green"
      ? "text-green-700 dark:text-green-400"
      : floor.status === "amber"
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";

  return (
    <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-white/5">
      <h2 className="text-lg font-bold text-brand dark:text-accent">Rate Guide</h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        What freelancers with your profile typically earn, from the Kenya freelance
        market model (Glassdoor KE, BrighterMonday, Arc.dev and more, July 2026).
        Goodturn takes no fee — what you charge is what you keep.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as RateModelRole)} className={selectCls}>
            {RATE_MODEL_ROLES.map((r) => (
              <option key={r} value={r}>{BASE_RATES[r].label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Client market
          <select value={market} onChange={(e) => setMarket(e.target.value as ClientMarket)} className={selectCls}>
            <option value="local">Local (Kenyan clients)</option>
            <option value="international">International clients</option>
          </select>
        </label>
        <label className="text-sm">
          Experience
          <select value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel)} className={selectCls}>
            {EXPERIENCE_OPTIONS.map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Skill tier
          <select value={skill} onChange={(e) => setSkill(e.target.value as SkillTier)} className={selectCls}>
            {SKILL_OPTIONS.map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Reputation
          <select value={reputation} onChange={(e) => setReputation(e.target.value as ReputationTier)} className={selectCls}>
            {REPUTATION_OPTIONS.map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </label>
        {market === "local" ? (
          <label className="text-sm">
            Where in Kenya
            <select value={location} onChange={(e) => setLocation(e.target.value as KenyaLocation)} className={selectCls}>
              {LOCATION_OPTIONS.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </label>
        ) : (
          <label className="text-sm">
            Billable hours / month
            <input
              type="number" min={60} max={200}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value) || 120)}
              className={selectCls}
            />
          </label>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-neutral-100 p-3 dark:bg-white/10">
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Low</p>
          <p className="mt-1 font-bold">{formatKESRate(band.low)}</p>
        </div>
        <div className="rounded-xl bg-brand p-3 text-white dark:bg-accent">
          <p className="text-xs uppercase tracking-wide opacity-80">Suggested</p>
          <p className="mt-1 text-lg font-extrabold">{formatKESRate(band.suggested)}</p>
        </div>
        <div className="rounded-xl bg-neutral-100 p-3 dark:bg-white/10">
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">High</p>
          <p className="mt-1 font-bold">{formatKESRate(band.high)}</p>
        </div>
      </div>

      <p className={`mt-3 text-sm font-medium ${floorColor}`}>
        ≈ {formatKES(floor.monthly)}/month at {hours} billable hours.
        {floor.status !== "green" && <span className="mt-1 block font-normal">{FLOOR_ADVICE[floor.status]}</span>}
      </p>

      <button
        type="button"
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="mt-3 text-sm font-semibold text-brand underline-offset-4 hover:underline dark:text-accent"
      >
        {showBreakdown ? "Hide" : "Show"} how this is calculated
      </button>
      {showBreakdown && (
        <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Base rate for {BASE_RATES[role].label} ({market === "local" ? "local" : "international"} market:{" "}
          {formatKESRate(BASE_RATES[role][market])}) × experience × skill premium × reputation
          {market === "local" && " × location"} — the six-factor model from the Kenya Freelance
          Pricing Report (July 2026). Suggested is the point estimate; low/high are ×0.80/×1.25.
        </p>
      )}
    </section>
  );
}
