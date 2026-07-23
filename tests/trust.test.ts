import { describe, it, expect } from "vitest";
import { employerBadge, shouldAutoHide, AUTO_HIDE_THRESHOLD } from "@/lib/trust";

describe("employerBadge", () => {
  it("returns 'verified' when isVerified, regardless of hires", () => {
    expect(employerBadge({ isVerified: true, completedHires: 0 })).toBe("verified");
  });
  it("returns 'established' at >= 1 completed hire when not verified", () => {
    expect(employerBadge({ isVerified: false, completedHires: 1 })).toBe("established");
    expect(employerBadge({ isVerified: false, completedHires: 9 })).toBe("established");
  });
  it("returns null with no hires and not verified", () => {
    expect(employerBadge({ isVerified: false, completedHires: 0 })).toBe(null);
  });
});

describe("shouldAutoHide", () => {
  it("is false below the threshold", () => {
    expect(shouldAutoHide(AUTO_HIDE_THRESHOLD - 1)).toBe(false);
    expect(shouldAutoHide(0)).toBe(false);
  });
  it("is true at or above the threshold", () => {
    expect(shouldAutoHide(AUTO_HIDE_THRESHOLD)).toBe(true);
    expect(shouldAutoHide(AUTO_HIDE_THRESHOLD + 5)).toBe(true);
  });
  it("uses a threshold of 3", () => {
    expect(AUTO_HIDE_THRESHOLD).toBe(3);
  });
});
