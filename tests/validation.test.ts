import { describe, it, expect } from "vitest";
import {
  signupSchema,
  jobCreateSchema,
  applicationPatchSchema,
  jobQuerySchema,
  contactSchema,
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
  const valid = { title: "Build a site", description: "A description with more than twenty characters.", categoryId: "c1", estimatedHours: 10, price: 150 };
  it("accepts a valid job", () => {
    expect(jobCreateSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects zero hours and zero price", () => {
    expect(jobCreateSchema.safeParse({ ...valid, estimatedHours: 0 }).success).toBe(false);
    expect(jobCreateSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
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
