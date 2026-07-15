import { describe, it, expect } from "vitest";
import { matchScore, rankJobs } from "@/lib/match";

const job = (title: string, categoryName: string, description = "") => ({ title, description, categoryName });

describe("matchScore", () => {
  it("gives 3 points for an exact category match", () => {
    expect(matchScore("design", job("Anything", "Design"))).toBe(3);
  });
  it("gives 1 point for a keyword found in title/description", () => {
    expect(matchScore("react", job("React dashboard fixes", "Development"))).toBe(1);
  });
  it("sums points across skills", () => {
    expect(matchScore("development, react", job("React dashboard fixes", "Development"))).toBe(4);
  });
  it("returns 0 for empty skills", () => {
    expect(matchScore("", job("React dashboard fixes", "Development"))).toBe(0);
  });
  it("is case- and whitespace-insensitive", () => {
    expect(matchScore("  DESIGN ", job("Logo work", "design"))).toBe(3);
  });
});

describe("rankJobs", () => {
  it("sorts by score descending and drops zero-score jobs", () => {
    const jobs = [
      job("Data entry for shop", "Data Entry"),
      job("React dashboard fixes", "Development"),
      job("Design a logo", "Design"),
    ];
    const ranked = rankJobs("design, react", jobs);
    expect(ranked.map((j) => j.title)).toEqual(["Design a logo", "React dashboard fixes"]);
    expect(ranked[0].score).toBe(4); // category exact (3) + "design" in title (1)
  });
});
