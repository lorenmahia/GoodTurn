import { describe, it, expect } from "vitest";
import { generatePublicUserId } from "@/lib/ids";

describe("generatePublicUserId", () => {
  it("matches GT-XXXXXX with uppercase alphanumerics", () => {
    for (let i = 0; i < 50; i++) {
      expect(generatePublicUserId()).toMatch(/^GT-[A-Z0-9]{6}$/);
    }
  });

  it("is not constant", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generatePublicUserId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});
