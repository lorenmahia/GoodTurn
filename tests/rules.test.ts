import { describe, it, expect } from "vitest";
import { minimumPrice, isPriceAllowed, canTransition, median, suggestedTotal } from "@/lib/rules";
import { formatKES, formatKESRate } from "@/lib/currency";

describe("minimumPrice", () => {
  it("multiplies rate by hours", () => {
    expect(minimumPrice(8, 24)).toBe(192);
  });
  it("rounds to cents", () => {
    expect(minimumPrice(7.333, 3)).toBe(22);
  });
});

describe("isPriceAllowed", () => {
  it("allows price at exactly the minimum", () => {
    expect(isPriceAllowed(192, 8, 24)).toBe(true);
  });
  it("rejects price below the minimum", () => {
    expect(isPriceAllowed(191.99, 8, 24)).toBe(false);
  });
  it("allows price above the minimum", () => {
    expect(isPriceAllowed(500, 8, 24)).toBe(true);
  });
});

describe("canTransition", () => {
  it("PENDING can go to WISHLISTED, ACCEPTED, DENIED", () => {
    expect(canTransition("PENDING", "WISHLISTED")).toBe(true);
    expect(canTransition("PENDING", "ACCEPTED")).toBe(true);
    expect(canTransition("PENDING", "DENIED")).toBe(true);
  });
  it("WISHLISTED can go to ACCEPTED or DENIED but not back to PENDING", () => {
    expect(canTransition("WISHLISTED", "ACCEPTED")).toBe(true);
    expect(canTransition("WISHLISTED", "DENIED")).toBe(true);
    expect(canTransition("WISHLISTED", "PENDING")).toBe(false);
  });
  it("ACCEPTED and DENIED are terminal", () => {
    expect(canTransition("ACCEPTED", "DENIED")).toBe(false);
    expect(canTransition("DENIED", "ACCEPTED")).toBe(false);
  });
  it("no-op transitions are rejected", () => {
    expect(canTransition("PENDING", "PENDING")).toBe(false);
  });
});

describe("median", () => {
  it("returns the middle value for odd counts", () => {
    expect(median([300, 900, 500])).toBe(500);
  });
  it("averages the middle pair for even counts", () => {
    expect(median([200, 400, 600, 1000])).toBe(500);
  });
  it("returns null for an empty list", () => {
    expect(median([])).toBeNull();
  });
  it("handles a single value", () => {
    expect(median([750])).toBe(750);
  });
});

describe("suggestedTotal", () => {
  it("multiplies rate by hours and rounds to cents", () => {
    expect(suggestedTotal(400, 24)).toBe(9600);
    expect(suggestedTotal(7.333, 3)).toBe(22);
  });
});

describe("formatKES", () => {
  it("formats whole amounts with thousands separators", () => {
    expect(formatKES(5000)).toBe("KSh 5,000");
    expect(formatKES(19800)).toBe("KSh 19,800");
  });
  it("keeps two decimals only when fractional", () => {
    expect(formatKES(750.5)).toBe("KSh 750.50");
    expect(formatKES(400)).toBe("KSh 400");
  });
});

describe("formatKESRate", () => {
  it("appends /h", () => {
    expect(formatKESRate(900)).toBe("KSh 900/h");
  });
});
