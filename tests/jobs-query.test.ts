import { describe, it, expect } from "vitest";
import { buildJobWhere, buildJobOrderBy } from "@/lib/jobs";
import { jobQuerySchema } from "@/lib/validation";

describe("buildJobWhere", () => {
  it("always restricts to OPEN, non-hidden jobs", () => {
    expect(buildJobWhere(jobQuerySchema.parse({}))).toEqual({ status: "OPEN", hidden: false });
  });
  it("adds keyword OR clause and price range", () => {
    const where = buildJobWhere(jobQuerySchema.parse({ q: "react", minPrice: "100", maxPrice: "300" }));
    expect(where.OR).toEqual([
      { title: { contains: "react" } },
      { description: { contains: "react" } },
    ]);
    expect(where.price).toEqual({ gte: 100, lte: 300 });
  });
  it("filters by category name", () => {
    expect(buildJobWhere(jobQuerySchema.parse({ category: "Design" })).category).toEqual({ name: "Design" });
  });
});

describe("buildJobOrderBy", () => {
  it("maps sort values", () => {
    expect(buildJobOrderBy("newest")).toEqual({ createdAt: "desc" });
    expect(buildJobOrderBy("price-asc")).toEqual({ price: "asc" });
    expect(buildJobOrderBy("price-desc")).toEqual({ price: "desc" });
  });
});
