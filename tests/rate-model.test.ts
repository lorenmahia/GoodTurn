import { describe, it, expect } from "vitest";
import { predictRate, costFloorStatus } from "@/lib/rate-model";

describe("predictRate — report worked examples", () => {
  it("Profile A: entry VA, local Nairobi, Upwork ≈ KES 92/hr", () => {
    const band = predictRate({
      role: "va-basic", market: "local", experience: "entry",
      skill: "generalist", reputation: "none", platform: "upwork", location: "nairobi",
    });
    // 142 × 0.65 × 1.00 × 0.90 ÷ 0.90 × 1.00 = 92.3 → 92
    expect(band.suggested).toBe(92);
  });

  it("Profile B: mid graphic designer, international, specialist, established, Fiverr ≈ KES 8,529/hr", () => {
    const band = predictRate({
      role: "graphic-designer", market: "international", experience: "mid",
      skill: "specialist", reputation: "established", platform: "fiverr", location: "mombasa",
    });
    // 5169 × 1.00 × 1.20 × 1.10 ÷ 0.80 (location ignored for international) = 8528.85 → 8529
    expect(band.suggested).toBe(8529);
  });

  it("Profile D: senior dev, international, in-demand, certified, direct ≈ KES 17,640/hr", () => {
    const band = predictRate({
      role: "software-dev-senior", market: "international", experience: "senior",
      skill: "in-demand", reputation: "certified", platform: "direct", location: "nairobi",
    });
    // 7754 × 1.25 × 1.40 × 1.30 ÷ 1.00 = 17640.35 → 17640
    expect(band.suggested).toBe(17640);
  });

  it("Profile E: junior writer, local Kisumu, direct ≈ KES 140/hr", () => {
    const band = predictRate({
      role: "content-writer", market: "local", experience: "junior",
      skill: "generalist", reputation: "early", platform: "direct", location: "kisumu-nakuru",
    });
    // 219 × 0.85 × 1.00 × 1.00 ÷ 1.00 × 0.75 = 139.6 → 140
    expect(band.suggested).toBe(140);
  });

  it("location is ignored for international clients (report §5.6: L = 1.00)", () => {
    const nairobi = predictRate({ role: "content-writer", market: "international", experience: "mid", skill: "generalist", reputation: "early", platform: "direct", location: "nairobi" });
    const rural = predictRate({ ...{ role: "content-writer", market: "international", experience: "mid", skill: "generalist", reputation: "early", platform: "direct" }, location: "rural" } as Parameters<typeof predictRate>[0]);
    expect(rural.suggested).toBe(nairobi.suggested);
  });

  it("band is low ×0.80 / high ×1.25 of suggested (report §8.2)", () => {
    const band = predictRate({ role: "data-analyst-mid", market: "international", experience: "mid", skill: "generalist", reputation: "early", platform: "direct", location: "nairobi" });
    expect(band.low).toBe(Math.round(band.suggested * 0.8));
    expect(band.high).toBe(Math.round(band.suggested * 1.25));
  });

  it("suggestion is capped at the KES 19,385/hr guard rail (report §8.4)", () => {
    const band = predictRate({ role: "cybersecurity", market: "international", experience: "expert", skill: "ai-ml", reputation: "certified", platform: "direct", location: "nairobi" });
    expect(band.suggested).toBeLessThanOrEqual(19385);
  });
});

describe("costFloorStatus — report §6.2", () => {
  it("flags a local entry rate as red (Profile A: KES 92/hr × 120h ≪ floor)", () => {
    expect(costFloorStatus(92, 120).status).toBe("red");
  });
  it("marks a strong international rate green (Profile B net tier)", () => {
    expect(costFloorStatus(6800, 80).status).toBe("green");
  });
  it("amber within 25% above the floor", () => {
    // floor midpoint: KES 129,000–223,000/mo need → use 176,000; at 120h = 1,467/hr
    expect(costFloorStatus(1700, 120).status).toBe("amber");
  });
});
