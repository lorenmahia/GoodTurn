import { describe, it, expect } from "vitest";
import { participantRole, isParticipant, canSendMessage } from "@/lib/connect";

const base = { clientId: "client-1", freelancerId: "free-1", status: "ACTIVE" };

describe("participantRole", () => {
  it("identifies the client", () => expect(participantRole(base, "client-1")).toBe("client"));
  it("identifies the freelancer", () => expect(participantRole(base, "free-1")).toBe("freelancer"));
  it("returns null for a stranger", () => expect(participantRole(base, "someone-else")).toBe(null));
});

describe("isParticipant", () => {
  it("is true for either party", () => {
    expect(isParticipant(base, "client-1")).toBe(true);
    expect(isParticipant(base, "free-1")).toBe(true);
  });
  it("is false for a stranger", () => expect(isParticipant(base, "x")).toBe(false));
});

describe("canSendMessage", () => {
  it("allows a participant on an ACTIVE connection", () => {
    expect(canSendMessage(base, "client-1")).toBe(true);
  });
  it("blocks a participant once CLOSED", () => {
    expect(canSendMessage({ ...base, status: "CLOSED" }, "client-1")).toBe(false);
  });
  it("blocks a stranger even when ACTIVE", () => {
    expect(canSendMessage(base, "x")).toBe(false);
  });
});
