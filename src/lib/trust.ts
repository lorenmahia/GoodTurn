/** Trust & Safety pure helpers. No prisma, no I/O.
 *  Verification is derived from behaviour; auto-hide is a fixed threshold. */

export type EmployerBadge = "verified" | "established" | null;

/** Verified (admin override) beats Established (>= 1 completed hire) beats none. */
export function employerBadge(u: { isVerified: boolean; completedHires: number }): EmployerBadge {
  if (u.isVerified) return "verified";
  if (u.completedHires >= 1) return "established";
  return null;
}

export const EMPLOYER_BADGE_LABEL: Record<"verified" | "established", string> = {
  verified: "Verified employer",
  established: "Established employer",
};

export const REPORT_REASONS = [
  "SCAM",
  "ASKED_FOR_MONEY",
  "OFF_PLATFORM",
  "SPAM_DUPLICATE",
  "INAPPROPRIATE",
  "OTHER",
] as const;

export const REPORT_REASON_LABEL: Record<(typeof REPORT_REASONS)[number], string> = {
  SCAM: "Looks like a scam",
  ASKED_FOR_MONEY: "Asked me to pay money",
  OFF_PLATFORM: "Trying to move off Goodturn",
  SPAM_DUPLICATE: "Spam or duplicate listing",
  INAPPROPRIATE: "Inappropriate content",
  OTHER: "Something else",
};

/** A job hides once this many DISTINCT users have reported it. */
export const AUTO_HIDE_THRESHOLD = 3;

export function shouldAutoHide(distinctReportCount: number): boolean {
  return distinctReportCount >= AUTO_HIDE_THRESHOLD;
}
