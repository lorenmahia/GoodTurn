import { describe, it, expect } from "vitest";
import { findContactInfo } from "@/lib/moderation";

const kinds = (text: string) => findContactInfo(text).map((h) => h.kind);

describe("findContactInfo — positives", () => {
  it("flags plain emails", () => {
    expect(kinds("reach me at jane@gmail.com")).toContain("email");
  });
  it("flags spelled-out emails", () => {
    expect(kinds("jane at gmail dot com")).toContain("email");
    expect(kinds("jane(at)yahoo(dot)co(dot)ke")).toContain("email");
  });
  it("flags Kenyan mobile numbers", () => {
    expect(kinds("call 0712 345 678")).toContain("phone");
    expect(kinds("+254 712-345-678")).toContain("phone");
    expect(kinds("0712345678")).toContain("phone");
  });
  it("flags spaced digit evasions", () => {
    expect(kinds("0 7 1 2 3 4 5 6 7 8")).toContain("phone");
  });
  it("flags URLs and bare domains", () => {
    expect(kinds("see https://mysite.com/portfolio")).toContain("url");
    expect(kinds("visit www.janedesigns.co.ke")).toContain("url");
    expect(kinds("mysite.co.ke has samples")).toContain("url");
    expect(kinds("wa.me/254712345678")).toContain("url");
  });
  it("flags messenger handles near platform names", () => {
    expect(kinds("find me on telegram @janedoe")).toContain("url");
    expect(kinds("WhatsApp me on 0712345678")).toContain("phone");
  });
});

describe("findContactInfo — negatives (must NOT flag)", () => {
  const clean = [
    "I can deliver in 8 hours for KSh 5,000",
    "I wrote 1200 words each for 6 articles",
    "Experienced in Node.js and Next.js",
    "3D design and 2D animation",
    "500 SKUs entered with 99.5% accuracy",
    "Available 9 to 5, Monday to Friday",
    "My rate is KSh 750.50 per hour",
    "Since 2019 I have completed 47 projects",
  ];
  for (const text of clean) {
    it(`passes: "${text}"`, () => {
      expect(findContactInfo(text)).toEqual([]);
    });
  }
});
