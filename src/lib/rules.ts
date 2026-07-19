export const APPLICATION_STATUSES = ["PENDING", "WISHLISTED", "ACCEPTED", "DENIED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const JOB_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export function minimumPrice(typicalHourlyRate: number, estimatedHours: number): number {
  return Math.round(typicalHourlyRate * estimatedHours * 100) / 100;
}

export function isPriceAllowed(price: number, typicalHourlyRate: number, estimatedHours: number): boolean {
  return price >= minimumPrice(typicalHourlyRate, estimatedHours);
}

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  PENDING: ["WISHLISTED", "ACCEPTED", "DENIED"],
  WISHLISTED: ["ACCEPTED", "DENIED"],
  ACCEPTED: [],
  DENIED: [],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
