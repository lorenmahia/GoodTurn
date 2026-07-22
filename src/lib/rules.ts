export const APPLICATION_STATUSES = ["PENDING", "WISHLISTED", "ACCEPTED", "DENIED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const JOB_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  PENDING: ["WISHLISTED", "ACCEPTED", "DENIED"],
  WISHLISTED: ["ACCEPTED", "DENIED"],
  ACCEPTED: [],
  DENIED: [],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function suggestedTotal(hourlyRate: number, estimatedHours: number): number {
  return Math.round(hourlyRate * estimatedHours * 100) / 100;
}
