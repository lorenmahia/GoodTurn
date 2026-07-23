/** Job-scoped Connect thread lifecycle rules. Pure — no prisma, no I/O.
 *  A connection has exactly two participants and a status; these helpers
 *  are the single source of truth for "who may read/write this thread". */

export type ConnectionParties = {
  clientId: string;
  freelancerId: string;
  status: string; // ACTIVE | CLOSED
};

export function participantRole(
  c: ConnectionParties,
  userId: string
): "client" | "freelancer" | null {
  if (userId === c.clientId) return "client";
  if (userId === c.freelancerId) return "freelancer";
  return null;
}

export function isParticipant(c: ConnectionParties, userId: string): boolean {
  return participantRole(c, userId) !== null;
}

export function canSendMessage(c: ConnectionParties, userId: string): boolean {
  return c.status === "ACTIVE" && isParticipant(c, userId);
}

export const CLOSED_THREAD_NOTICE =
  "This job is complete, so this thread is closed. Post or find your next job on Goodturn.";
