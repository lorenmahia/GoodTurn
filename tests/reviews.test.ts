import { describe, it, expect } from "vitest";
import {
  reviewDirection,
  subjectFor,
  overallRating,
  isRevealed,
  jobSuccessScore,
  REVIEW_CRITERIA,
  REVIEW_WINDOW_DAYS,
} from "@/lib/reviews";

const conn = { clientId: "client1", freelancerId: "free1" };

describe("reviewDirection", () => {
  it("maps the client author to CLIENT_ON_FREELANCER", () => {
    expect(reviewDirection(conn, "client1")).toBe("CLIENT_ON_FREELANCER");
  });
  it("maps the freelancer author to FREELANCER_ON_CLIENT", () => {
    expect(reviewDirection(conn, "free1")).toBe("FREELANCER_ON_CLIENT");
  });
  it("returns null for an outsider", () => {
    expect(reviewDirection(conn, "stranger")).toBe(null);
  });
});

describe("subjectFor", () => {
  it("returns the freelancer when the client authors", () => {
    expect(subjectFor(conn, "client1")).toBe("free1");
  });
  it("returns the client when the freelancer authors", () => {
    expect(subjectFor(conn, "free1")).toBe("client1");
  });
  it("returns null for an outsider", () => {
    expect(subjectFor(conn, "stranger")).toBe(null);
  });
});

describe("overallRating", () => {
  it("averages the three criteria", () => {
    expect(overallRating({ ratingA: 5, ratingB: 5, ratingC: 5 })).toBe(5);
    expect(overallRating({ ratingA: 4, ratingB: 5, ratingC: 3 })).toBe(4);
  });
});

describe("isRevealed", () => {
  const now = new Date("2026-07-24T00:00:00Z");
  it("reveals immediately when the counterpart exists", () => {
    expect(isRevealed({ counterpartExists: true, closedAt: now, now })).toBe(true);
  });
  it("stays hidden with no counterpart before the window elapses", () => {
    const closedAt = new Date("2026-07-20T00:00:00Z"); // 4 days earlier
    expect(isRevealed({ counterpartExists: false, closedAt, now })).toBe(false);
  });
  it("reveals once the window has elapsed even without a counterpart", () => {
    const closedAt = new Date("2026-07-01T00:00:00Z"); // 23 days earlier
    expect(isRevealed({ counterpartExists: false, closedAt, now })).toBe(true);
  });
  it("stays hidden when there is no closedAt and no counterpart", () => {
    expect(isRevealed({ counterpartExists: false, closedAt: null, now })).toBe(false);
  });
  const WINDOW_MS = REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  it("reveals exactly at the 14-day boundary (>=, not >)", () => {
    const closedAt = new Date(now.getTime() - WINDOW_MS);
    expect(isRevealed({ counterpartExists: false, closedAt, now })).toBe(true);
  });
  it("stays hidden one millisecond before the 14-day boundary", () => {
    const closedAt = new Date(now.getTime() - (WINDOW_MS - 1));
    expect(isRevealed({ counterpartExists: false, closedAt, now })).toBe(false);
  });
  it("uses a 14-day window", () => {
    expect(REVIEW_WINDOW_DAYS).toBe(14);
  });
});

describe("jobSuccessScore", () => {
  it("returns a null score and breakdown for no reviews", () => {
    expect(jobSuccessScore([])).toEqual({ score: null, count: 0, breakdown: null });
  });
  it("averages overall scores and each criterion, rounded to 1 dp", () => {
    const result = jobSuccessScore([
      { ratingA: 5, ratingB: 5, ratingC: 4 }, // overall 4.6667
      { ratingA: 4, ratingB: 4, ratingC: 4 }, // overall 4
    ]);
    expect(result.count).toBe(2);
    expect(result.score).toBe(4.3);
    expect(result.breakdown).toEqual({ a: 4.5, b: 4.5, c: 4 });
  });
});

describe("REVIEW_CRITERIA", () => {
  it("has three role-specific labels per direction", () => {
    expect(REVIEW_CRITERIA.CLIENT_ON_FREELANCER).toEqual([
      "Quality of work",
      "Communication",
      "Professionalism",
    ]);
    expect(REVIEW_CRITERIA.FREELANCER_ON_CLIENT).toEqual([
      "Clear requirements",
      "Communication",
      "Respect & reliability",
    ]);
  });
});
