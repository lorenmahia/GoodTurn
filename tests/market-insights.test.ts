import { describe, it, expect } from "vitest";
import { MARKET_INSIGHTS, seniorityBands } from "@/lib/market-insights";
import { BASE_RATES } from "@/lib/rate-model";

describe("market insights dataset", () => {
  it("covers every rate-model role exactly once", () => {
    const roles = MARKET_INSIGHTS.flatMap((g) => g.roles.map((r) => r.role)).sort();
    expect(roles).toEqual(Object.keys(BASE_RATES).sort());
  });

  it("every trend badge cites a public source", () => {
    for (const group of MARKET_INSIGHTS) {
      for (const role of group.roles) {
        if (role.trend) expect(role.trend.source.length).toBeGreaterThan(3);
      }
    }
  });

  it("every role links to Goodturn Learn", () => {
    for (const group of MARKET_INSIGHTS) {
      for (const role of group.roles) {
        expect(role.learnHref.startsWith("/learn")).toBe(true);
      }
    }
  });
});

describe("seniorityBands", () => {
  it("derives entry/mid/senior from the report experience curve", () => {
    // Content writer local base 219: entry x0.65 = 142, mid x1.00 = 219, senior x1.25 = 274
    expect(seniorityBands("content-writer")).toEqual({ entry: 142, mid: 219, senior: 274 });
  });
});
