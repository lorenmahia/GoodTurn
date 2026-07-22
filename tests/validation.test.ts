import { describe, it, expect } from "vitest";
import {
  signupSchema,
  jobCreateSchema,
  applicationPatchSchema,
  jobQuerySchema,
  contactSchema,
  applySchema,
  profilePatchSchema,
} from "@/lib/validation";

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse({ email: "a@b.com", password: "longenough", displayName: "Alice" }).success).toBe(true);
  });
  it("rejects short passwords and bad emails", () => {
    expect(signupSchema.safeParse({ email: "a@b.com", password: "short", displayName: "Alice" }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "not-an-email", password: "longenough", displayName: "Alice" }).success).toBe(false);
  });
});

describe("jobCreateSchema", () => {
  const base = { title: "Design a logo", description: "A modern logo for a Nairobi bakery, three concepts.", categoryId: "c1", estimatedHours: 10 };
  it("accepts a FIXED job with a price", () => {
    expect(jobCreateSchema.safeParse({ ...base, paymentType: "FIXED", price: 8000 }).success).toBe(true);
  });
  it("accepts an HOURLY job with a rate", () => {
    expect(jobCreateSchema.safeParse({ ...base, paymentType: "HOURLY", hourlyRate: 800 }).success).toBe(true);
  });
  it("rejects FIXED without price and HOURLY without rate", () => {
    expect(jobCreateSchema.safeParse({ ...base, paymentType: "FIXED" }).success).toBe(false);
    expect(jobCreateSchema.safeParse({ ...base, paymentType: "HOURLY" }).success).toBe(false);
  });
  it("accepts any positive price — no floor", () => {
    expect(jobCreateSchema.safeParse({ ...base, paymentType: "FIXED", price: 1 }).success).toBe(true);
  });
  it("rejects a short title", () => {
    expect(jobCreateSchema.safeParse({ ...base, title: "Hi", paymentType: "FIXED", price: 8000 }).success).toBe(false);
  });
});

describe("applicationPatchSchema", () => {
  it("accepts only WISHLISTED/ACCEPTED/DENIED", () => {
    expect(applicationPatchSchema.safeParse({ status: "ACCEPTED" }).success).toBe(true);
    expect(applicationPatchSchema.safeParse({ status: "PENDING" }).success).toBe(false);
    expect(applicationPatchSchema.safeParse({ status: "NOPE" }).success).toBe(false);
  });
});

describe("jobQuerySchema", () => {
  it("defaults sort to newest and coerces prices", () => {
    const parsed = jobQuerySchema.parse({ minPrice: "100" });
    expect(parsed.sort).toBe("newest");
    expect(parsed.minPrice).toBe(100);
  });
  it("rejects unknown sort values", () => {
    expect(jobQuerySchema.safeParse({ sort: "oldest" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("requires a real message", () => {
    expect(contactSchema.safeParse({ name: "Jo", email: "jo@x.com", message: "Hello, I need help." }).success).toBe(true);
    expect(contactSchema.safeParse({ name: "Jo", email: "jo@x.com", message: "hi" }).success).toBe(false);
  });
});

describe("applySchema", () => {
  const base = { name: "Brian Otieno", location: "Nairobi", coverNote: "I have designed 30+ logos for local businesses." };
  it("accepts a complete application without a resume", () => {
    expect(applySchema.safeParse(base).success).toBe(true);
  });
  it("accepts an application with a resumeId", () => {
    expect(applySchema.safeParse({ ...base, resumeId: "r1" }).success).toBe(true);
  });
  it("rejects a short pitch", () => {
    expect(applySchema.safeParse({ ...base, coverNote: "hi" }).success).toBe(false);
  });
  it("rejects a missing location", () => {
    expect(applySchema.safeParse({ name: base.name, coverNote: base.coverNote }).success).toBe(false);
  });
});

describe("profilePatchSchema", () => {
  it("accepts an empty object", () => {
    expect(profilePatchSchema.safeParse({}).success).toBe(true);
  });
  it("accepts a full valid patch", () => {
    expect(profilePatchSchema.safeParse({ displayName: "Alice", bio: "Writer", skills: "writing, editing", hourlyRate: 12 }).success).toBe(true);
  });
  it("rejects negative hourlyRate", () => {
    expect(profilePatchSchema.safeParse({ hourlyRate: -1 }).success).toBe(false);
  });
  it("rejects displayName below 2-char min", () => {
    expect(profilePatchSchema.safeParse({ displayName: "A" }).success).toBe(false);
  });
  it("rejects skills over 500 chars", () => {
    expect(profilePatchSchema.safeParse({ skills: "x".repeat(501) }).success).toBe(false);
  });
});
