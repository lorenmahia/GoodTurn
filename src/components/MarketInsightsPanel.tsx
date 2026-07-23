import Link from "next/link";
import {
  MARKET_INSIGHTS,
  INSIGHTS_CAPTION,
  seniorityBands,
  type TrendTone,
} from "@/lib/market-insights";
import { BASE_RATES } from "@/lib/rate-model";
import { formatKESRate } from "@/lib/currency";

const TONE_CLS: Record<TrendTone, string> = {
  hot: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  rising: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  steady: "bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-neutral-300",
  pressure: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export default function MarketInsightsPanel() {
  return (
    <div>
      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-xs leading-relaxed text-neutral-600 dark:bg-white/5 dark:text-neutral-400">
        {INSIGHTS_CAPTION}
      </p>

      {MARKET_INSIGHTS.map((group) => (
        <section key={group.industry} className="mt-8">
          <h2 className="text-xl font-extrabold text-brand dark:text-accent">{group.industry}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.roles.map((r) => {
              const bands = seniorityBands(r.role);
              return (
                <div
                  key={r.role}
                  className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{BASE_RATES[r.role].label}</h3>
                    {r.trend && (
                      <span
                        title={r.trend.source}
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE_CLS[r.trend.tone]}`}
                      >
                        {r.trend.label}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-lg bg-neutral-100 p-2 dark:bg-white/10">
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Entry</p>
                      <p className="mt-0.5 font-semibold">{formatKESRate(bands.entry)}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-100 p-2 dark:bg-white/10">
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Mid</p>
                      <p className="mt-0.5 font-semibold">{formatKESRate(bands.mid)}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-100 p-2 dark:bg-white/10">
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Senior</p>
                      <p className="mt-0.5 font-semibold">{formatKESRate(bands.senior)}</p>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    International clients: <span className="font-semibold">{r.intlUsd}</span>
                  </p>
                  {r.trend && (
                    <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      Source: {r.trend.source}
                    </p>
                  )}

                  <Link
                    href={r.learnHref}
                    className="mt-3 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline dark:text-accent"
                  >
                    Grow into this on Goodturn Learn &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
