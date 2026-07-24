/** Reputation & review rules. Pure — no prisma, no I/O.
 *  Owns criteria labels, the double-blind reveal predicate, and score math. */

export type Direction = "CLIENT_ON_FREELANCER" | "FREELANCER_ON_CLIENT";

export const REVIEW_WINDOW_DAYS = 14;
const WINDOW_MS = REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export const REVIEW_CRITERIA: Record<Direction, [string, string, string]> = {
  CLIENT_ON_FREELANCER: ["Quality of work", "Communication", "Professionalism"],
  FREELANCER_ON_CLIENT: ["Clear requirements", "Communication", "Respect & reliability"],
};

type Parties = { clientId: string; freelancerId: string };

export function reviewDirection(c: Parties, authorId: string): Direction | null {
  if (authorId === c.clientId) return "CLIENT_ON_FREELANCER";
  if (authorId === c.freelancerId) return "FREELANCER_ON_CLIENT";
  return null;
}

export function subjectFor(c: Parties, authorId: string): string | null {
  if (authorId === c.clientId) return c.freelancerId;
  if (authorId === c.freelancerId) return c.clientId;
  return null;
}

type Ratings = { ratingA: number; ratingB: number; ratingC: number };

export function overallRating(r: Ratings): number {
  return (r.ratingA + r.ratingB + r.ratingC) / 3;
}

export function isRevealed(args: {
  counterpartExists: boolean;
  closedAt: Date | null;
  now: Date;
}): boolean {
  if (args.counterpartExists) return true;
  if (!args.closedAt) return false;
  return args.now.getTime() - args.closedAt.getTime() >= WINDOW_MS;
}

export type ScoreResult = {
  score: number | null;
  count: number;
  breakdown: { a: number; b: number; c: number } | null;
};

const round1 = (x: number): number => Math.round(x * 10) / 10;

export function jobSuccessScore(reviews: Ratings[]): ScoreResult {
  if (reviews.length === 0) return { score: null, count: 0, breakdown: null };
  const n = reviews.length;
  const sum = reviews.reduce(
    (acc, r) => ({
      a: acc.a + r.ratingA,
      b: acc.b + r.ratingB,
      c: acc.c + r.ratingC,
      overall: acc.overall + overallRating(r),
    }),
    { a: 0, b: 0, c: 0, overall: 0 }
  );
  return {
    score: round1(sum.overall / n),
    count: n,
    breakdown: { a: round1(sum.a / n), b: round1(sum.b / n), c: round1(sum.c / n) },
  };
}
