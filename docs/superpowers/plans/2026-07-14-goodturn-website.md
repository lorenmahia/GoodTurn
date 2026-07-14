# Goodturn Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Goodturn Company website (marketing pages + real auth, job posting, applications, search/matching, profiles; stubbed payments/Connect/Learn) per `docs/superpowers/specs/2026-07-14-goodturn-website-design.md`.

**Architecture:** Single Next.js App Router (TypeScript) project at repo root. Server components read the database through shared query helpers; client components call JSON API routes. Business rules live in pure functions under `src/lib/` so they are unit-testable without a database.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma + SQLite, next-auth@5 (Auth.js, credentials provider), bcryptjs, Zod, Vitest, tsx.

## Global Constraints

- Node.js ≥ 18.18 required (machine has 18.12 — Task 1 Step 1 installs portable Node 22; **prepend it to PATH in every shell session**: `$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"`).
- All commands below are PowerShell run from repo root `C:\Users\lmahi\Goodturn` unless noted.
- Brand colors (exact values from spec): brand indigo `#3B4A8C`, accent purple `#7B6FD0`, charcoal `#2E2E2E`, ink black `#0A0A0F`.
- Job/application statuses are strings (SQLite has no enums): Job `OPEN|IN_PROGRESS|COMPLETED|CANCELLED`; Application `PENDING|WISHLISTED|ACCEPTED|DENIED`.
- Price rule (spec): `price ≥ category.minHourlyRate × estimatedHours`.
- Error contract for all API routes: 400 invalid input, 401 unauthenticated, 403 not owner, 404 missing; error body `{ "error": ... }`.
- Copy/text must match the spec's page tables (taken from the approved prototype).
- Do NOT commit `dev.db`, `node_modules`, `.next`, or `sample_webpage_recording.mp4`.
- Commit after every task (messages given per task).

---

### Task 1: Scaffold Next.js project with Tailwind, Vitest, and brand theme

**Files:**
- Create: entire Next.js scaffold at repo root (`package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `postcss.config.mjs`, `.gitignore`)
- Create: `vitest.config.ts`
- Test: none (scaffold verification is `npm test` running an empty suite + dev server rendering)

**Interfaces:**
- Consumes: nothing.
- Produces: import alias `@/*` → `src/*`; Tailwind theme tokens `bg-brand`, `bg-accent`, `bg-charcoal`, `bg-ink` (and `text-…` variants) used by every UI task; `npm test` (vitest run), `npm run dev`, `npm run build`.

- [ ] **Step 1: Install portable Node 22 (machine Node is 18.12, too old for Next 15)**

```powershell
if (-not (Test-Path "$env:USERPROFILE\node22\node-v22.12.0-win-x64\node.exe")) {
  curl.exe -L -o "$env:USERPROFILE\node22.zip" "https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip"
  Expand-Archive "$env:USERPROFILE\node22.zip" "$env:USERPROFILE\node22" -Force
}
$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"
node --version
```

Expected: `v22.12.0`. (Repeat the `$env:Path = …` line at the start of every new shell.)

- [ ] **Step 2: Scaffold Next.js in the repo root**

The repo root already contains `docs/`, `.claude/`, `.git/`, and the recording. `create-next-app` refuses non-empty dirs, so scaffold into a temp dir and move files in:

```powershell
$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"
npx --yes create-next-app@15 goodturn-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
Get-ChildItem goodturn-tmp -Force | Where-Object Name -ne ".git" | Move-Item -Destination . -Force
Remove-Item goodturn-tmp -Recurse -Force
```

Expected: `package.json`, `src/app/`, `next.config.ts` now at repo root.

- [ ] **Step 3: Ensure .gitignore covers our artifacts**

Append to `.gitignore` (create-next-app already lists node_modules/.next):

```gitignore
# local database & media
dev.db
dev.db-journal
prisma/dev.db
prisma/dev.db-journal
sample_webpage_recording.mp4
```

- [ ] **Step 4: Add brand theme to `src/app/globals.css`**

Replace the file with:

```css
@import "tailwindcss";

@theme {
  --color-brand: #3b4a8c;
  --color-accent: #7b6fd0;
  --color-charcoal: #2e2e2e;
  --color-ink: #0a0a0f;
}

body {
  @apply bg-white text-neutral-900 antialiased;
}
```

- [ ] **Step 5: Install Vitest and wire `npm test`**

```powershell
npm install -D vitest
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["tests/**/*.test.ts"], passWithNoTests: true },
});
```

In `package.json` `"scripts"`, add: `"test": "vitest run"`.

- [ ] **Step 6: Verify scaffold**

```powershell
npm test
npm run build
```

Expected: vitest prints `No test files found, exiting with code 0`; build completes with `✓ Compiled successfully`.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: scaffold Next.js 15 app with Tailwind brand theme and Vitest"
```

---

### Task 2: Prisma schema, client singleton, and seed data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `src/lib/ids.ts`
- Create: `prisma/seed.ts`
- Test: `tests/ids.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `prisma` singleton (`import { prisma } from "@/lib/db"`); models `User`, `Category`, `Job`, `Application`, `ContactMessage` (fields below); `generatePublicUserId(): string` returning `GT-` + 6 uppercase alphanumerics; seeded categories/users/jobs; npm scripts `db:migrate`, `db:seed`.

- [ ] **Step 1: Install Prisma + runtime deps**

```powershell
$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"
npm install @prisma/client bcryptjs zod
npm install -D prisma tsx @types/bcryptjs
```

- [ ] **Step 2: Write failing test for public user ID format**

Create `tests/ids.test.ts`:

```ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/ids'` (or similar resolution error).

- [ ] **Step 4: Implement `src/lib/ids.ts`**

```ts
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no confusable 0/O/1/I/L

export function generatePublicUserId(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `GT-${out}`;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (2 tests).

- [ ] **Step 6: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id             String        @id @default(cuid())
  email          String        @unique
  passwordHash   String
  displayName    String
  bio            String        @default("")
  skills         String        @default("") // comma-separated
  hourlyRate     Float         @default(0)
  accountBalance Float         @default(0)
  publicUserId   String        @unique
  createdAt      DateTime      @default(now())
  jobsPosted     Job[]
  applications   Application[]
}

model Category {
  id            String @id @default(cuid())
  name          String @unique
  minHourlyRate Float
  jobs          Job[]
}

model Job {
  id             String        @id @default(cuid())
  title          String
  description    String
  categoryId     String
  category       Category      @relation(fields: [categoryId], references: [id])
  estimatedHours Float
  price          Float
  status         String        @default("OPEN") // OPEN|IN_PROGRESS|COMPLETED|CANCELLED
  posterId       String
  poster         User          @relation(fields: [posterId], references: [id])
  createdAt      DateTime      @default(now())
  applications   Application[]
}

model Application {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  applicantId String
  applicant   User     @relation(fields: [applicantId], references: [id])
  coverNote   String
  status      String   @default("PENDING") // PENDING|WISHLISTED|ACCEPTED|DENIED
  createdAt   DateTime @default(now())

  @@unique([jobId, applicantId])
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 7: Create `src/lib/db.ts` (singleton avoids exhausting SQLite connections on dev hot-reload)**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 8: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { generatePublicUserId } from "../src/lib/ids";

const prisma = new PrismaClient();

const CATEGORIES: [string, number][] = [
  ["Writing", 8],
  ["Design", 10],
  ["Development", 15],
  ["Data Entry", 5],
  ["Marketing", 8],
  ["Translation", 7],
  ["Video & Audio", 10],
  ["Customer Support", 6],
];

async function main() {
  for (const [name, minHourlyRate] of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: { minHourlyRate },
      create: { name, minHourlyRate },
    });
  }

  const passwordHash = await hash("demo1234", 10);
  const demoUsers = [
    { email: "alice@example.com", displayName: "Alice Wanjiku", skills: "writing, editing, blogging", bio: "Content writer with 5 years of experience.", hourlyRate: 12 },
    { email: "bob@example.com", displayName: "Bob Otieno", skills: "development, react, node", bio: "Full-stack developer.", hourlyRate: 25 },
    { email: "carol@example.com", displayName: "Carol Njeri", skills: "design, figma, branding", bio: "Product designer and illustrator.", hourlyRate: 18 },
  ];
  const users = [];
  for (const u of demoUsers) {
    users.push(
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash, publicUserId: generatePublicUserId() },
      })
    );
  }

  const cat = async (name: string) =>
    (await prisma.category.findUniqueOrThrow({ where: { name } })).id;

  const jobCount = await prisma.job.count();
  if (jobCount === 0) {
    const jobs = [
      { title: "Blog articles for a travel startup", description: "Write 6 SEO-friendly articles (1200 words each) about East African travel destinations.", category: await cat("Writing"), estimatedHours: 24, price: 220, posterId: users[1].id },
      { title: "Landing page redesign", description: "Redesign our SaaS landing page in Figma; deliver desktop and mobile frames.", category: await cat("Design"), estimatedHours: 16, price: 180, posterId: users[0].id },
      { title: "Next.js bug fixes", description: "Fix 4 open bugs in our Next.js dashboard (listed in GitHub issues).", category: await cat("Development"), estimatedHours: 10, price: 160, posterId: users[2].id },
      { title: "Product data entry (500 SKUs)", description: "Enter 500 products into our e-commerce admin with images and prices.", category: await cat("Data Entry"), estimatedHours: 20, price: 110, posterId: users[1].id },
      { title: "Social media campaign plan", description: "30-day Instagram and Twitter campaign plan for a fintech launch.", category: await cat("Marketing"), estimatedHours: 12, price: 100, posterId: users[0].id },
      { title: "English to Swahili translation", description: "Translate a 20-page user manual from English to Swahili.", category: await cat("Translation"), estimatedHours: 15, price: 110, posterId: users[2].id },
      { title: "Podcast editing (4 episodes)", description: "Edit four 45-minute podcast episodes: noise removal, intro/outro, level matching.", category: await cat("Video & Audio"), estimatedHours: 12, price: 130, posterId: users[1].id },
      { title: "Customer support (2 weeks cover)", description: "Answer email and chat tickets for two weeks while our agent is on leave.", category: await cat("Customer Support"), estimatedHours: 60, price: 380, posterId: users[0].id },
    ];
    for (const j of jobs) {
      await prisma.job.create({
        data: { title: j.title, description: j.description, categoryId: j.category, estimatedHours: j.estimatedHours, price: j.price, posterId: j.posterId },
      });
    }
    const firstJob = await prisma.job.findFirstOrThrow({ where: { title: "Blog articles for a travel startup" } });
    await prisma.application.create({
      data: { jobId: firstJob.id, applicantId: users[0].id, coverNote: "I have written 40+ travel articles; happy to share samples." },
    });
  }
  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 9: Wire npm scripts and run migration + seed**

In `package.json` add scripts `"db:migrate": "prisma migrate dev"`, `"db:seed": "tsx prisma/seed.ts"`, and a top-level key:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

Run:

```powershell
npx prisma migrate dev --name init
npm run db:seed
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); Promise.all([p.user.count(), p.job.count(), p.category.count()]).then(c => { console.log(c); return p.$disconnect(); })"
```

Expected: migration created under `prisma/migrations/`; `Seed complete.`; counts `[ 3, 8, 8 ]`.

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m "feat: add Prisma schema, db singleton, id generator, and seed data"
```

---

### Task 3: Business rules — price minimum and application state transitions (TDD)

**Files:**
- Create: `src/lib/rules.ts`
- Test: `tests/rules.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `minimumPrice(minHourlyRate: number, estimatedHours: number): number`; `isPriceAllowed(price: number, minHourlyRate: number, estimatedHours: number): boolean`; `type ApplicationStatus = "PENDING"|"WISHLISTED"|"ACCEPTED"|"DENIED"`; `canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean`. Used by Tasks 10 and 11.

- [ ] **Step 1: Write failing tests**

Create `tests/rules.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { minimumPrice, isPriceAllowed, canTransition } from "@/lib/rules";

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/rules`.

- [ ] **Step 3: Implement `src/lib/rules.ts`**

```ts
export const APPLICATION_STATUSES = ["PENDING", "WISHLISTED", "ACCEPTED", "DENIED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const JOB_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export function minimumPrice(minHourlyRate: number, estimatedHours: number): number {
  return Math.round(minHourlyRate * estimatedHours * 100) / 100;
}

export function isPriceAllowed(price: number, minHourlyRate: number, estimatedHours: number): boolean {
  return price >= minimumPrice(minHourlyRate, estimatedHours);
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all rules tests green).

- [ ] **Step 5: Commit**

```powershell
git add tests/rules.test.ts src/lib/rules.ts
git commit -m "feat: add price-minimum and application-transition business rules"
```

---

### Task 4: Match scoring (TDD)

**Files:**
- Create: `src/lib/match.ts`
- Test: `tests/match.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `matchScore(userSkills: string, job: { title: string; description: string; categoryName: string }): number`; `rankJobs<T extends { title: string; description: string; categoryName: string }>(userSkills: string, jobs: T[]): (T & { score: number })[]` sorted by score desc, zero-score jobs excluded. Used by Task 12 (`GET /api/match`) and Task 13 (Find Work page).

- [ ] **Step 1: Write failing tests**

Create `tests/match.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { matchScore, rankJobs } from "@/lib/match";

const job = (title: string, categoryName: string, description = "") => ({ title, description, categoryName });

describe("matchScore", () => {
  it("gives 3 points for an exact category match", () => {
    expect(matchScore("design", job("Anything", "Design"))).toBe(3);
  });
  it("gives 1 point for a keyword found in title/description", () => {
    expect(matchScore("react", job("React dashboard fixes", "Development"))).toBe(1);
  });
  it("sums points across skills", () => {
    expect(matchScore("development, react", job("React dashboard fixes", "Development"))).toBe(4);
  });
  it("returns 0 for empty skills", () => {
    expect(matchScore("", job("React dashboard fixes", "Development"))).toBe(0);
  });
  it("is case- and whitespace-insensitive", () => {
    expect(matchScore("  DESIGN ", job("Logo work", "design"))).toBe(3);
  });
});

describe("rankJobs", () => {
  it("sorts by score descending and drops zero-score jobs", () => {
    const jobs = [
      job("Data entry for shop", "Data Entry"),
      job("React dashboard fixes", "Development"),
      job("Design a logo", "Design"),
    ];
    const ranked = rankJobs("design, react", jobs);
    expect(ranked.map((j) => j.title)).toEqual(["Design a logo", "React dashboard fixes"]);
    expect(ranked[0].score).toBe(4); // category exact (3) + "design" in title (1)
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/match`.

- [ ] **Step 3: Implement `src/lib/match.ts`**

```ts
type MatchableJob = { title: string; description: string; categoryName: string };

export function matchScore(userSkills: string, job: MatchableJob): number {
  const skills = userSkills
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (skills.length === 0) return 0;

  const category = job.categoryName.toLowerCase().trim();
  const haystack = `${job.title} ${job.description}`.toLowerCase();

  let score = 0;
  for (const skill of skills) {
    if (category === skill) score += 3;
    if (haystack.includes(skill)) score += 1;
  }
  return score;
}

export function rankJobs<T extends MatchableJob>(userSkills: string, jobs: T[]): (T & { score: number })[] {
  return jobs
    .map((j) => ({ ...j, score: matchScore(userSkills, j) }))
    .filter((j) => j.score > 0)
    .sort((a, b) => b.score - a.score);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add tests/match.test.ts src/lib/match.ts
git commit -m "feat: add skill-overlap match scoring and ranking"
```

---

### Task 5: Zod validation schemas (TDD)

**Files:**
- Create: `src/lib/validation.ts`
- Test: `tests/validation.test.ts`

**Interfaces:**
- Consumes: `APPLICATION_STATUSES` from `@/lib/rules` (Task 3).
- Produces (all exported from `@/lib/validation`): `signupSchema` (`{ email, password ≥ 8 chars, displayName 2–60 }`), `jobCreateSchema` (`{ title 5–100, description 20–5000, categoryId, estimatedHours > 0 ≤ 1000, price > 0 }`), `applySchema` (`{ coverNote 10–2000 }`), `applicationPatchSchema` (`{ status: "WISHLISTED"|"ACCEPTED"|"DENIED" }`), `profilePatchSchema` (`{ displayName?, bio? ≤ 2000, skills? ≤ 500, hourlyRate? ≥ 0 }`), `contactSchema` (`{ name 2–80, email, message 10–5000 }`), `jobQuerySchema` (`{ q?, category?, minPrice?, maxPrice?, sort? }` with sort enum `newest|price-asc|price-desc` default `newest`, prices coerced from strings). Used by Tasks 6, 9, 10, 11, 12.

- [ ] **Step 1: Write failing tests**

Create `tests/validation.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/validation`.

- [ ] **Step 3: Implement `src/lib/validation.ts`**

```ts
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2).max(60),
});

export const jobCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  categoryId: z.string().min(1),
  estimatedHours: z.number().positive().max(1000),
  price: z.number().positive(),
});

export const applySchema = z.object({
  coverNote: z.string().min(10).max(2000),
});

export const applicationPatchSchema = z.object({
  status: z.enum(["WISHLISTED", "ACCEPTED", "DENIED"]),
});

export const profilePatchSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.string().max(500).optional(),
  hourlyRate: z.number().min(0).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
});

export const jobQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add tests/validation.test.ts src/lib/validation.ts
git commit -m "feat: add Zod validation schemas for all API inputs"
```

---

### Task 6: Authentication — signup API, Auth.js credentials login, middleware, auth pages

**Files:**
- Create: `src/auth.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/api/signup/route.ts`
- Create: `src/middleware.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/signup/page.tsx`
- Create: `.env.local` (never committed — already gitignored by create-next-app)
- Test: manual curl verification (route touches DB; business rules already unit-tested in Tasks 3–5)

**Interfaces:**
- Consumes: `prisma` (Task 2), `signupSchema` (Task 5), `generatePublicUserId` (Task 2).
- Produces: `auth(): Promise<Session | null>` from `@/auth` — **every later task uses this exact import** to read `session.user.id`; `POST /api/signup` accepting `{ email, password, displayName }` → 201 `{ id }`; Auth.js credential endpoints under `/api/auth/*`; middleware redirecting logged-out visitors to `/login?callbackUrl=…` for `/find-work`, `/post-a-job`, `/jobs/*`, `/account`, `/profile`.

- [ ] **Step 1: Install next-auth and create AUTH_SECRET**

```powershell
$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"
npm install next-auth@beta
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))" | Out-File -Encoding ascii .env.local
Get-Content .env.local
```

Expected: `.env.local` contains one line `AUTH_SECRET=<random base64>`.

- [ ] **Step 2: Create `src/auth.ts`**

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.displayName };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
```

- [ ] **Step 3: Create `src/types/next-auth.d.ts` (types `session.user.id` for TypeScript)**

```ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Create `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: Create `src/app/api/signup/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation";
import { generatePublicUserId } from "@/lib/ids";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: { email: ["This email is already registered"] } }, { status: 400 });
  }
  const user = await prisma.user.create({
    data: {
      email,
      displayName: parsed.data.displayName,
      passwordHash: await hash(parsed.data.password, 10),
      publicUserId: generatePublicUserId(),
    },
  });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
```

- [ ] **Step 6: Create `src/middleware.ts`**

The middleware only checks that a session cookie exists (cheap, edge-safe — it must not import Prisma). Real enforcement happens in every page/API via `auth()`.

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/find-work/:path*", "/post-a-job/:path*", "/jobs/:path*", "/account/:path*", "/profile/:path*"],
};
```

- [ ] **Step 7: Create `src/app/login/page.tsx`**

```tsx
"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(params.get("callbackUrl") ?? "/find-work");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-brand">Log in</h1>
      <p className="mt-1 text-sm text-neutral-600">Welcome back to Goodturn.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-brand py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-neutral-600">
        New to Goodturn?{" "}
        <Link href="/signup" className="font-medium text-brand underline">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 8: Create `src/app/signup/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors(typeof data.error === "object" && data.error ? data.error : { form: ["Signup failed. Please try again."] });
      setBusy(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/find-work");
    router.refresh();
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-brand">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-600">One account for finding work and posting jobs.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Display name</label>
          <input required value={form.displayName} onChange={set("displayName")} className={inputCls} />
          {fieldError("displayName") && <p className="mt-1 text-sm text-red-600">{fieldError("displayName")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required value={form.email} onChange={set("email")} className={inputCls} />
          {fieldError("email") && <p className="mt-1 text-sm text-red-600">{fieldError("email")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password (min 8 characters)</label>
          <input type="password" required value={form.password} onChange={set("password")} className={inputCls} />
          {fieldError("password") && <p className="mt-1 text-sm text-red-600">{fieldError("password")}</p>}
        </div>
        {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
        <button disabled={busy} className="w-full rounded bg-brand py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand underline">Log in</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 9: Verify signup + login end to end**

```powershell
Start-Process powershell -ArgumentList "-NoExit","-Command","`$env:Path = `"`$env:USERPROFILE\node22\node-v22.12.0-win-x64;`$env:Path`"; cd C:\Users\lmahi\Goodturn; npm run dev"
Start-Sleep 8
curl.exe -s -X POST http://localhost:3000/api/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"displayName\":\"Test User\"}"
curl.exe -s -X POST http://localhost:3000/api/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"displayName\":\"Test User\"}"
curl.exe -s -o /dev/null -w "%{http_code}" http://localhost:3000/account
```

Expected: first curl → `{"id":"..."}`; second → `{"error":{"email":["This email is already registered"]}}`; third → `307` (redirect to /login). Then in a browser: log in at `http://localhost:3000/login` with `alice@example.com` / `demo1234` — should land on /find-work (404 for now; page comes in Task 13 — the redirect itself is the success signal).

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m "feat: add credentials auth, signup API, middleware, and auth pages"
```

---

### Task 7: Shared UI shell — Logo, Navbar, Footer, ChatBubble, ComingSoon, layout

**Files:**
- Create: `src/components/Logo.tsx`
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/ChatBubble.tsx`
- Create: `src/components/ComingSoon.tsx`
- Modify: `src/app/layout.tsx` (replace scaffold version)
- Test: visual check in dev server + `npm run build`

**Interfaces:**
- Consumes: `auth()` (Task 6).
- Produces: `<Navbar userName={string | null} />`, `<Footer />`, `<ChatBubble />`, `<Logo className? />`, `<ComingSoon label={string} note={string} className? />` (button that swaps to its note text when clicked — used by home page "Go to Connect" and account "Withdraw"). Layout renders navbar/footer/chat on every page.

- [ ] **Step 1: Create `src/components/Logo.tsx`**

```tsx
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" className={className} aria-hidden fill="#4a6bd6">
      {/* stylized eagle: two swept wings meeting at a head */}
      <path d="M24 12C19 3 9 0 1 3c7 3 10 6 12 13 3-5 7-6 11-2 4-4 8-3 11 2C37 9 40 6 47 3 39 0 29 3 24 12Z" />
      <circle cx="24" cy="15" r="3" />
      <path d="M24 18l-3 9h6l-3-9Z" />
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/components/Navbar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/find-work", label: "Find Work" },
  { href: "/post-a-job", label: "Post a Job" },
  { href: "/learn", label: "Learn" },
  { href: "/account", label: "Account" },
];

export default function Navbar({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);

  const authControls = userName ? (
    <>
      <Link href="/account" className="text-sm text-neutral-300 hover:text-white">Hi, {userName}</Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
      >
        Log out
      </button>
    </>
  ) : (
    <Link href="/login" className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
      Sign up/Log in
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-charcoal text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-wide">Goodturn</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">{authControls}</div>
        <button aria-label="Menu" onClick={() => setOpen(!open)} className="p-1 md:hidden">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {open && (
        <nav className="space-y-1 border-t border-neutral-700 px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded px-2 py-2 hover:bg-neutral-700">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-2 pt-2">{authControls}</div>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Create `src/components/Footer.tsx`**

```tsx
import Link from "next/link";
import Logo from "./Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Read and Learn",
    links: [
      { label: "Our User Guide", href: "/how-it-works" },
      { label: "Reference Library", href: "/learn" },
      { label: "News", href: "/learn" },
    ],
  },
  {
    heading: "Connect and Ask",
    links: [
      { label: "Goodturn Forum", href: "/learn" },
      { label: "Trusted Agencies", href: "/learn" },
      { label: "FAQ's", href: "/how-it-works" },
    ],
  },
  {
    heading: "Bookmark and Follow",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Blog", href: "/learn" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center gap-4">
          <div className="rounded bg-black p-2">
            <Logo className="h-10 w-10" />
          </div>
          <span className="text-xl font-semibold">Goodturn Company</span>
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-semibold">{col.heading}</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-800 bg-[#0d0d1a]">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 px-4 py-5 text-sm text-neutral-300">
          <span>Copyright Goodturn {new Date().getFullYear()}</span>
          <Link href="/" className="hover:text-white">About the Company</Link>
          <Link href="/how-it-works" className="hover:text-white">Terms and conditions</Link>
          <Link href="/contact" className="hover:text-white">Reset password</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Create `src/components/ChatBubble.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
          <h3 className="font-semibold text-brand">Goodturn Connect</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Chat, calls and SMS with your clients are coming soon. You will be automatically
            logged in to Goodturn Connect when you post a job or are accepted for one.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open Goodturn Connect chat"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:bg-accent"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
          <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1Z" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/ComingSoon.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function ComingSoon({
  label,
  note,
  className = "rounded bg-ink px-6 py-3 font-medium text-white hover:bg-neutral-700",
}: {
  label: string;
  note: string;
  className?: string;
}) {
  const [clicked, setClicked] = useState(false);
  if (clicked) return <p className="text-sm font-medium text-accent">{note}</p>;
  return (
    <button onClick={() => setClicked(true)} className={className}>
      {label}
    </button>
  );
}
```

- [ ] **Step 6: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBubble";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goodturn — Freelancers, Businesses and Industry Experts",
  description:
    "Goodturn connects freelancers, businesses and industry experts through Goodturn Jobs, Goodturn Connect and Goodturn Learn.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar userName={session?.user?.name ?? null} />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatBubble />
      </body>
    </html>
  );
}
```

Note: delete the scaffold's Geist font imports if present — system font stack is fine.

- [ ] **Step 7: Verify**

Run: `npm run build` — expect `✓ Compiled successfully`. With dev server running, `http://localhost:3000` shows charcoal navbar, footer columns, floating chat bubble that opens the "coming soon" panel; hamburger menu appears below 768px width.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "feat: add navbar, footer, chat bubble, and shared layout shell"
```

---

### Task 8: Homepage

**Files:**
- Create: `src/app/page.tsx` (replace scaffold page)
- Delete: scaffold assets `src/app/favicon.ico` stays; remove unused `public/*.svg` from create-next-app
- Test: visual check + `npm run build`

**Interfaces:**
- Consumes: `<ComingSoon>` (Task 7).
- Produces: `/` route. No exports consumed elsewhere.

- [ ] **Step 1: Replace `src/app/page.tsx` with the full homepage**

```tsx
import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";

function MountainHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#16324f] via-[#1d2a44] to-charcoal text-white">
      <svg viewBox="0 0 1440 320" className="absolute bottom-0 left-0 w-full opacity-30" preserveAspectRatio="none" aria-hidden>
        <path fill="#0b1526" d="M0 320 320 96l224 160L768 64l288 192 176-128 208 160v32H0Z" />
        <path fill="#10203a" d="m0 320 256-128 192 96 256-192 320 224 224-160 192 160H0Z" />
      </svg>
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <p className="font-semibold">We Connect</p>
        <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">
          Freelancers, Businesses and Industry Experts
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-neutral-200">
          Through our three core businesses, Goodturn Jobs, Goodturn Connect and Goodturn Learn, users can
          easily <strong>Find jobs</strong> online, Individuals and businesses can <strong>Post work</strong>,
          users can <strong>Connect</strong> with the clients and businesses they are working with, and these
          users are able to obtain skills necessary to find better jobs through Goodturn <strong>Learn.</strong>
        </p>
        <Link href="/contact" className="mt-10 inline-block rounded-lg bg-brand px-8 py-3 font-medium tracking-wide hover:bg-accent">
          Contact us
        </Link>
      </div>
    </section>
  );
}

function JobsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <h2 className="text-4xl font-extrabold">Goodturn Jobs</h2>
        <div className="flex flex-col gap-3">
          <Link href="/post-a-job" className="rounded bg-ink px-6 py-3 text-center font-medium text-white hover:bg-neutral-700">Post a Job</Link>
          <Link href="/how-it-works" className="rounded bg-accent px-6 py-3 text-center font-medium text-white hover:opacity-90">How it Works</Link>
        </div>
      </div>

      <h3 className="mt-6 text-2xl font-bold text-brand">To Clients</h3>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-bold text-brand">Large and High Quality Freelancer Skillset</h4>
            <p className="mt-2 leading-relaxed text-neutral-700">
              Our freelancers are highly skilled in a wide variety of skillsets that enables almost any work
              that can be done online to be made possible. We also provide in-app specialists to help
              freelancers thus increasing the quality of the work output. Our freelancer learn with us
              program also ensures that freelancers are ready for any challenges in relation to your job
              description.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-brand">High Quality Work</h4>
            <p className="mt-2 leading-relaxed text-neutral-700">
              Our platform screens freelancers based on their educational background, skill set and matches
              them to your job posting through our artificial intelligence system to ensure you get the best
              match possible. Users are encouraged to learn constantly and acquire new certificates which
              boosts their ranking.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-ink p-8 text-white">
          <h4 className="text-xl font-bold">You Set the Price</h4>
          <p className="mt-3 leading-relaxed text-neutral-300">
            You are responsible for setting your own price for the Job. However, for each category, depending
            on the number of hours estimated for the job and job complexity, there is a minimum amount
            required in order to encourage freelancers to apply for your Job.
          </p>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap items-start justify-between gap-6">
        <h3 className="text-2xl font-bold text-brand">To Freelancers</h3>
        <div className="flex flex-col gap-3">
          <Link href="/find-work" className="rounded bg-ink px-6 py-3 text-center font-medium text-white hover:bg-neutral-700">Find Work</Link>
          <Link href="/how-it-works" className="rounded bg-accent px-6 py-3 text-center font-medium text-white hover:opacity-90">How it Works</Link>
        </div>
      </div>
      <div className="mt-6 max-w-xl">
        <h4 className="text-xl font-bold text-brand">Fast Payment System</h4>
        <p className="mt-2 leading-relaxed text-neutral-700">
          We accept Visa, Mastercard, PayPal, Mpesa and all Crypto Wallets ensuring that your mode of payment
          is available globally. In addition, our secure checkout system guarantees your money's safety.
        </p>
      </div>
    </section>
  );
}

function LearnSection() {
  return (
    <section className="bg-brand text-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-4xl font-extrabold">Goodturn Learn</h2>
        <p className="mt-4 max-w-2xl text-lg text-neutral-200">
          A World Class Learning system designed to teach all levels of Knowledge from beginners to industry
          experts.
        </p>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">Want to Learn …</h3>
            <p className="mt-3 leading-relaxed text-neutral-200">
              Browse over 100 different categories for certificates offered through Linkedin, Google
              Certificates, Universities and our own expert material. Each certificate earned gets you closer
              to better paying Jobs.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Already an Expert …</h3>
            <p className="mt-3 leading-relaxed text-neutral-200">
              Through Goodturn Learn, you get paid to teach freelancers on the topic of your expertise. We
              feature 20 different Topic categories with hundreds of subcategories to ensure your experience
              and knowledge are well compensated for.
            </p>
            <p className="mt-3 leading-relaxed text-neutral-200">
              You choose the amount and rate you are paid, have a board where you post your experience or
              designs and chat with potential customers via Goodturn Connect.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link href="/learn" className="inline-block rounded bg-ink px-8 py-3 font-medium text-white hover:bg-neutral-700">
            Go to Learn Page
          </Link>
        </div>
      </div>
    </section>
  );
}

function ConnectSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center text-4xl font-extrabold">Goodturn Connect</h2>
      <div className="mt-12 grid items-start gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-brand">Connect With Users anywhere through Video, call, chat and SMS</h3>
          <p className="mt-3 leading-relaxed text-neutral-700">
            We know you are eager to apply for jobs all over the world. We want you to feel connected to your
            customers as though you are in person.
          </p>
          <p className="mt-3 leading-relaxed text-neutral-700">
            Goodturn connect allows you to gain the best experience through our team management and direct
            messaging features.
          </p>
          <p className="mt-4 font-semibold leading-relaxed text-brand">
            Please Note: You will be automatically logged in to Goodturn Connect when you Post a Job or are
            Accepted for a job. Use your Account ID to sign up to the Goodturn Connect Platform. Your ID can
            be found in the Accounts page.
          </p>
          <div className="mt-8">
            <ComingSoon label="Go to Connect" note="Goodturn Connect is coming soon — stay tuned!" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-brand via-[#2a3568] to-ink p-10 text-white">
          <p className="text-lg font-semibold">Team management, direct messaging, file sharing and in-app APIs</p>
          <p className="mt-3 text-neutral-300">
            The Goodturn Connect Workstation keeps you and your clients on the same page from kickoff to
            completion.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <MountainHero />
      <JobsSection />
      <LearnSection />
      <ConnectSection />
    </>
  );
}
```

- [ ] **Step 2: Remove leftover scaffold assets**

```powershell
Remove-Item public\next.svg, public\vercel.svg, public\file.svg, public\globe.svg, public\window.svg -ErrorAction SilentlyContinue
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expect success. In the browser, `/` shows: hero (We Connect / headline / intro / Contact us), Goodturn Jobs with To Clients + To Freelancers and black "You Set the Price" card, indigo Learn panel, Connect section whose "Go to Connect" button swaps to a coming-soon note when clicked.

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: add homepage with jobs, learn, and connect sections"
```

---

### Task 9: Static pages + contact form — How it Works, Learn, Contact (page + API)

**Files:**
- Create: `src/app/how-it-works/page.tsx`
- Create: `src/app/learn/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/api/contact/route.ts`
- Test: curl for the API; visual check for pages

**Interfaces:**
- Consumes: `prisma`, `contactSchema`.
- Produces: routes `/how-it-works`, `/learn`, `/contact`; `POST /api/contact` `{ name, email, message }` → 201 `{ ok: true }`.

- [ ] **Step 1: Create `src/app/how-it-works/page.tsx`**

```tsx
const STEPS: { title: string; body: string[]; dark?: boolean }[] = [
  {
    title: "Click Post A Job Button and Enter Job Details",
    body: [
      "The Job Details page contains pop ups and guidelines to help with deciding cost, wording and sensitive data.",
      "You may choose to Pay the entire cost of the Job upfront or when you accept a freelancer. This amount is fully refundable if the Job is deleted. You may choose to submit payment from your own account or an external wallet such as bank, credit card or block chain transactions.",
      "Once you Submit the Job, it is live to freelancers who may start sending in their applications.",
    ],
  },
  {
    title: "Receive Applications",
    dark: true,
    body: [
      "You may start receiving Job Applications from freelancers depending on the level of traffic.",
      "Filter Applications based on Rating, location, Category, Experience level and previous Jobs. You may: i) Add Applicants to your Wishlist. ii) Deny Applicants — they will be removed from the Applicant pool. iii) Accept Applicants — once an applicant has been accepted, you will be redirected to our Goodturn Connect Workstation where you can communicate with your workers, submit files and use our in app features and APIs to improve the quality of your work.",
      "Please note: Once you have accepted a worker, we may monitor the amount of work done by an individual to ensure fair payment goes to every party.",
    ],
  },
  {
    title: "Submission Requests",
    body: [
      "Once worker(s) complete a project, they submit a completion request.",
      "This request acts as a contract between you and the worker(s) certifying that the Job is Complete.",
      "You will rate the each worker and submit comments about their work. This is important to boost the workers rating.",
    ],
  },
  {
    title: "Completion and Payment Release",
    dark: true,
    body: [
      "Once you approve the completion request, the Job is marked Complete.",
      "Payment is released to the worker(s) and reflects in their account balance, ready to withdraw.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-4xl font-extrabold">How it Works</h1>
          <p className="mt-4 max-w-3xl text-lg text-neutral-200">
            Below is a step by step guideline on how to Post a job with a Summary of the entire Post a Job
            workflow.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold">The Post A Job Workflow</h2>
        <ol className="mt-12 space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-6">
              <span className="text-5xl font-extrabold text-neutral-400">{i + 1}</span>
              <div
                className={`flex-1 rounded-2xl p-8 ${
                  step.dark ? "bg-ink text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                <h3 className={`text-xl font-bold ${step.dark ? "text-white" : "text-brand"}`}>{step.title}</h3>
                {step.body.map((p, j) => (
                  <p key={j} className={`mt-3 leading-relaxed ${step.dark ? "text-neutral-300" : ""}`}>
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/learn/page.tsx`**

```tsx
export default function LearnPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-brand">Page Under Construction</h1>
      <svg viewBox="0 0 24 24" className="mx-auto mt-10 h-40 w-40 text-ink" fill="currentColor" aria-hidden>
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm9.4-2.6-1.7-.3a7.7 7.7 0 0 0-.5-1.2l1-1.5a.7.7 0 0 0-.1-.9l-1.6-1.6a.7.7 0 0 0-.9-.1l-1.5 1a7.7 7.7 0 0 0-1.2-.5l-.3-1.7a.7.7 0 0 0-.7-.6h-2.2a.7.7 0 0 0-.7.6l-.3 1.7c-.4.1-.8.3-1.2.5l-1.5-1a.7.7 0 0 0-.9.1L5.5 7.5a.7.7 0 0 0-.1.9l1 1.5c-.2.4-.4.8-.5 1.2l-1.7.3a.7.7 0 0 0-.6.7v2.2c0 .3.2.6.6.7l1.7.3c.1.4.3.8.5 1.2l-1 1.5a.7.7 0 0 0 .1.9l1.6 1.6c.2.2.6.3.9.1l1.5-1c.4.2.8.4 1.2.5l.3 1.7c.1.4.4.6.7.6h2.2c.3 0 .6-.2.7-.6l.3-1.7c.4-.1.8-.3 1.2-.5l1.5 1c.3.2.7.1.9-.1l1.6-1.6a.7.7 0 0 0 .1-.9l-1-1.5c.2-.4.4-.8.5-1.2l1.7-.3a.7.7 0 0 0 .6-.7v-2.2a.7.7 0 0 0-.6-.7Z" />
      </svg>
      <p className="mt-10 text-neutral-500">
        Goodturn Learn — certificates, expert teaching and the reference library — is on its way.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/app/api/contact/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  await prisma.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ ok: true }, { status: 201 });
}
```

- [ ] **Step 4: Create `src/app/contact/page.tsx`**

```tsx
"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors(typeof data.error === "object" && data.error ? data.error : { form: ["Something went wrong. Please try again."] });
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-brand">Thank you!</h1>
        <p className="mt-4 text-neutral-600">Your message has been received. We will get back to you shortly.</p>
      </div>
    );
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-brand">Contact us</h1>
      <p className="mt-1 text-sm text-neutral-600">Questions about Goodturn? Send us a message.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          {fieldError("name") && <p className="mt-1 text-sm text-red-600">{fieldError("name")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          {fieldError("email") && <p className="mt-1 text-sm text-red-600">{fieldError("email")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
          {fieldError("message") && <p className="mt-1 text-sm text-red-600">{fieldError("message")}</p>}
        </div>
        {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
        <button disabled={busy} className="w-full rounded bg-brand py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

With dev server running:

```powershell
curl.exe -s -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Jo\",\"email\":\"jo@x.com\",\"message\":\"Hello, I need help with posting.\"}"
curl.exe -s -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Jo\",\"email\":\"jo@x.com\",\"message\":\"hi\"}"
```

Expected: first → `{"ok":true}`; second → 400 with a `message` field error. `/how-it-works` shows 4 numbered workflow cards (2 dark); `/learn` shows the construction gear.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: add how-it-works, learn placeholder, and contact form with API"
```

---

### Task 10: Jobs API — search/list, create, detail

**Files:**
- Create: `src/lib/jobs.ts`
- Create: `src/app/api/jobs/route.ts`
- Create: `src/app/api/jobs/[id]/route.ts`
- Test: `tests/jobs-query.test.ts` (pure query-shape helper) + curl

**Interfaces:**
- Consumes: `prisma`, `auth`, `jobQuerySchema`, `jobCreateSchema`, `isPriceAllowed`, `minimumPrice`.
- Produces: `searchJobs(query: JobQuery)` and `buildJobWhere(query: JobQuery)` from `@/lib/jobs` (Task 13's Find Work page reuses `searchJobs` — same results as the API, no duplication); `GET /api/jobs` → `{ jobs: [...] }`; `POST /api/jobs` → 201 `{ job }`; `GET /api/jobs/[id]` → `{ job }` (plus `applications` array only when the requester is the poster).

- [ ] **Step 1: Write failing test for the query builder**

Create `tests/jobs-query.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildJobWhere, buildJobOrderBy } from "@/lib/jobs";
import { jobQuerySchema } from "@/lib/validation";

describe("buildJobWhere", () => {
  it("always restricts to OPEN jobs", () => {
    expect(buildJobWhere(jobQuerySchema.parse({}))).toEqual({ status: "OPEN" });
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/jobs`.

- [ ] **Step 3: Implement `src/lib/jobs.ts`**

```ts
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { jobQuerySchema } from "@/lib/validation";

export type JobQuery = z.infer<typeof jobQuerySchema>;

export function buildJobWhere(query: JobQuery): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: "OPEN" };
  if (query.q) {
    where.OR = [{ title: { contains: query.q } }, { description: { contains: query.q } }];
  }
  if (query.category) {
    where.category = { name: query.category };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }
  return where;
}

export function buildJobOrderBy(sort: JobQuery["sort"]): Prisma.JobOrderByWithRelationInput {
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  return { createdAt: "desc" };
}

export async function searchJobs(query: JobQuery) {
  return prisma.job.findMany({
    where: buildJobWhere(query),
    orderBy: buildJobOrderBy(query.sort),
    include: { category: true, poster: { select: { displayName: true } } },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Create `src/app/api/jobs/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobCreateSchema, jobQuerySchema } from "@/lib/validation";
import { isPriceAllowed, minimumPrice } from "@/lib/rules";
import { searchJobs } from "@/lib/jobs";

export async function GET(req: Request) {
  const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = jobQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  return NextResponse.json({ jobs: await searchJobs(parsed.data) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: { categoryId: ["Unknown category"] } }, { status: 400 });
  }

  const { price, estimatedHours } = parsed.data;
  if (!isPriceAllowed(price, category.minHourlyRate, estimatedHours)) {
    const min = minimumPrice(category.minHourlyRate, estimatedHours);
    return NextResponse.json(
      { error: { price: [`The minimum for ${category.name} at ${estimatedHours} hours is $${min}`] } },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({ data: { ...parsed.data, posterId: session.user.id } });
  return NextResponse.json({ job }, { status: 201 });
}
```

- [ ] **Step 6: Create `src/app/api/jobs/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({
    where: { id },
    include: { category: true, poster: { select: { id: true, displayName: true } } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session?.user?.id === job.posterId) {
    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        applicant: { select: { displayName: true, skills: true, hourlyRate: true, publicUserId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ job, applications });
  }
  return NextResponse.json({ job });
}
```

- [ ] **Step 7: Verify with curl (dev server running)**

```powershell
curl.exe -s "http://localhost:3000/api/jobs?category=Design"
curl.exe -s "http://localhost:3000/api/jobs?sort=bogus"
curl.exe -s -X POST http://localhost:3000/api/jobs -H "Content-Type: application/json" -d "{}"
```

Expected: first → JSON with the seeded Design job; second → 400 sort error; third → 401 `{"error":"Not signed in"}`.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "feat: add jobs search/create/detail API with price-minimum enforcement"
```

---

### Task 11: Applications API — apply, and poster status changes

**Files:**
- Create: `src/app/api/jobs/[id]/apply/route.ts`
- Create: `src/app/api/applications/[id]/route.ts`
- Test: business rules already covered by `tests/rules.test.ts`; endpoint verification by curl + UI in Task 15

**Interfaces:**
- Consumes: `prisma`, `auth`, `applySchema`, `applicationPatchSchema`, `canTransition`, `ApplicationStatus`.
- Produces: `POST /api/jobs/[id]/apply` `{ coverNote }` → 201 `{ application }` (403 self-apply, 400 duplicate/closed, 404 no job); `PATCH /api/applications/[id]` `{ status }` → `{ application }` (poster only; ACCEPTED also sets job status `IN_PROGRESS`).

- [ ] **Step 1: Create `src/app/api/jobs/[id]/apply/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { applySchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.posterId === session.user.id) {
    return NextResponse.json({ error: "You cannot apply to your own job" }, { status: 403 });
  }
  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer open for applications" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_applicantId: { jobId: id, applicantId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: { jobId: id, applicantId: session.user.id, coverNote: parsed.data.coverNote },
  });
  return NextResponse.json({ application }, { status: 201 });
}
```

- [ ] **Step 2: Create `src/app/api/applications/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { applicationPatchSchema } from "@/lib/validation";
import { canTransition, type ApplicationStatus } from "@/lib/rules";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = applicationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const application = await prisma.application.findUnique({ where: { id }, include: { job: true } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.job.posterId !== session.user.id) {
    return NextResponse.json({ error: "Only the job poster can manage applications" }, { status: 403 });
  }

  const from = application.status as ApplicationStatus;
  const to = parsed.data.status;
  if (!canTransition(from, to)) {
    return NextResponse.json({ error: `Cannot change application from ${from} to ${to}` }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: to } }),
    ...(to === "ACCEPTED"
      ? [prisma.job.update({ where: { id: application.jobId }, data: { status: "IN_PROGRESS" } })]
      : []),
  ]);
  return NextResponse.json({ application: updated });
}
```

- [ ] **Step 3: Verify unauthenticated guards with curl**

```powershell
curl.exe -s -X POST http://localhost:3000/api/jobs/nope/apply -H "Content-Type: application/json" -d "{\"coverNote\":\"I would love to help with this.\"}"
curl.exe -s -X PATCH http://localhost:3000/api/applications/nope -H "Content-Type: application/json" -d "{\"status\":\"ACCEPTED\"}"
```

Expected: both → 401 `{"error":"Not signed in"}`. (Authenticated paths are exercised through the UI in Task 15's verification.)

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: add apply and application status-change APIs with ownership guards"
```

---

### Task 12: Match + Profile APIs

**Files:**
- Create: `src/app/api/match/route.ts`
- Create: `src/app/api/profile/route.ts`
- Test: scoring covered by `tests/match.test.ts`; endpoint guards by curl

**Interfaces:**
- Consumes: `prisma`, `auth`, `rankJobs`, `profilePatchSchema`.
- Produces: `GET /api/match` → `{ jobs: [{ …job, categoryName, score }] }` (open jobs not posted by me, ranked); `GET /api/profile` → `{ user }` (own profile, no passwordHash); `PATCH /api/profile` → `{ user }`.

- [ ] **Step 1: Create `src/app/api/match/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rankJobs } from "@/lib/match";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN", NOT: { posterId: user.id } },
    include: { category: true, poster: { select: { displayName: true } } },
  });
  const ranked = rankJobs(
    user.skills,
    jobs.map((j) => ({ ...j, categoryName: j.category.name }))
  );
  return NextResponse.json({ jobs: ranked });
}
```

- [ ] **Step 2: Create `src/app/api/profile/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { profilePatchSchema } from "@/lib/validation";

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  displayName: true,
  bio: true,
  skills: true,
  hourlyRate: true,
  accountBalance: true,
  publicUserId: true,
  createdAt: true,
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: PUBLIC_FIELDS });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: PUBLIC_FIELDS,
  });
  return NextResponse.json({ user });
}
```

- [ ] **Step 3: Verify guards**

```powershell
curl.exe -s http://localhost:3000/api/match
curl.exe -s http://localhost:3000/api/profile
```

Expected: both → 401 `{"error":"Not signed in"}`.

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: add match ranking and profile APIs"
```

---

### Task 13: Find Work page

**Files:**
- Create: `src/components/JobCard.tsx`
- Create: `src/components/QuickLinks.tsx`
- Create: `src/app/find-work/page.tsx`
- Test: visual check + `npm run build`

**Interfaces:**
- Consumes: `auth`, `prisma`, `searchJobs`, `jobQuerySchema`, `rankJobs`.
- Produces: `/find-work` route; `<JobCard job={…} />` (also used by Task 16's account lists); `<QuickLinks />` sidebar. Search uses a plain GET `<form>` (no client JS); "More filters" is a `<details>` disclosure; "Find Best Match" links to `/find-work?match=1`.

- [ ] **Step 1: Create `src/components/JobCard.tsx`**

```tsx
import Link from "next/link";

export type JobCardData = {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedHours: number;
  status: string;
  createdAt: Date;
  category: { name: string };
  poster: { displayName: string };
  score?: number;
};

export default function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-brand">{job.title}</h3>
        <span className="whitespace-nowrap rounded bg-ink px-2 py-1 text-sm font-semibold text-white">
          ${job.price}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{job.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">{job.category.name}</span>
        <span>~{job.estimatedHours}h</span>
        <span>by {job.poster.displayName}</span>
        {typeof job.score === "number" && (
          <span className="ml-auto font-semibold text-brand">match score {job.score}</span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `src/components/QuickLinks.tsx`**

```tsx
import Link from "next/link";

const LINKS = [
  { label: "My Jobs", href: "/account#my-applications" },
  { label: "My Profile", href: "/profile" },
  { label: "Jobs I Posted", href: "/account#jobs-posted" },
  { label: "Withdraw Funds", href: "/account" },
];

export default function QuickLinks() {
  return (
    <aside className="rounded-2xl border border-neutral-200 p-5">
      <h2 className="text-center font-semibold">Quick Links</h2>
      <ul className="mt-4 space-y-3">
        {LINKS.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="block rounded-lg bg-neutral-50 px-4 py-3 text-center font-medium tracking-wide text-brand shadow-sm hover:bg-neutral-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 3: Create `src/app/find-work/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobQuerySchema } from "@/lib/validation";
import { searchJobs } from "@/lib/jobs";
import { rankJobs } from "@/lib/match";
import JobCard, { type JobCardData } from "@/components/JobCard";
import QuickLinks from "@/components/QuickLinks";

export default async function FindWorkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/find-work");

  const raw = await searchParams;
  const parsed = jobQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : jobQuerySchema.parse({});
  const matchMode = raw.match === "1";

  let jobs: JobCardData[];
  if (matchMode) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
    const open = await prisma.job.findMany({
      where: { status: "OPEN", NOT: { posterId: user.id } },
      include: { category: true, poster: { select: { displayName: true } } },
    });
    jobs = rankJobs(user.skills, open.map((j) => ({ ...j, categoryName: j.category.name })));
  } else {
    jobs = await searchJobs(query);
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-brand to-[#2a3568] px-6 py-10 text-white">
        <h1 className="text-3xl font-bold">Welcome{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-2 text-lg text-neutral-200">Looking for work. We got you!!</p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <form method="get" action="/find-work" className="rounded-xl border border-neutral-200 p-4">
            <div className="flex flex-wrap gap-3">
              <input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Search for Work"
                className="min-w-48 flex-1 rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none"
              />
              <select
                name="category"
                defaultValue={query.category ?? ""}
                className="rounded border border-neutral-300 px-3 py-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button className="rounded bg-brand px-5 py-2 font-medium text-white hover:bg-accent">Search</button>
            </div>
            <details className="mt-3" open={query.minPrice !== undefined || query.maxPrice !== undefined || query.sort !== "newest"}>
              <summary className="cursor-pointer select-none rounded bg-accent px-4 py-2 text-sm font-medium text-white [display:inline-block]">
                More filters
              </summary>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <label>
                  Min price{" "}
                  <input name="minPrice" type="number" min="0" defaultValue={query.minPrice ?? ""} className="w-24 rounded border border-neutral-300 px-2 py-1" />
                </label>
                <label>
                  Max price{" "}
                  <input name="maxPrice" type="number" min="0" defaultValue={query.maxPrice ?? ""} className="w-24 rounded border border-neutral-300 px-2 py-1" />
                </label>
                <label>
                  Sort{" "}
                  <select name="sort" defaultValue={query.sort} className="rounded border border-neutral-300 px-2 py-1">
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                </label>
              </div>
            </details>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">
              {matchMode
                ? `Best matches for your skills — ${jobs.length} found. Complete your profile to make it more accurate.`
                : `${jobs.length} open job${jobs.length === 1 ? "" : "s"}`}
            </p>
            {matchMode ? (
              <Link href="/find-work" className="rounded bg-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-300">
                Back to all jobs
              </Link>
            ) : (
              <Link href="/find-work?match=1" className="rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
                Find Best Match
              </Link>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {jobs.length === 0 && (
            <p className="mt-10 text-center text-neutral-500">
              {matchMode
                ? "No matches yet — add skills to your profile so we can match you."
                : "No jobs found. Try different filters."}
            </p>
          )}
        </div>
        <QuickLinks />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

`npm run build` succeeds. Logged in as `alice@example.com`, `/find-work` lists 8 seeded jobs; searching `react` finds the Next.js job; category `Design` filters to one; `?match=1` ranks writing jobs first for Alice (skills: writing, editing, blogging) and shows match scores.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add find-work page with search, filters, and best-match mode"
```

---

### Task 14: Post a Job page

**Files:**
- Create: `src/components/PostJobForm.tsx`
- Create: `src/app/post-a-job/page.tsx`
- Test: visual check + curl already covered API; manual post

**Interfaces:**
- Consumes: `auth`, `prisma` (categories list), `POST /api/jobs` (Task 10), `minimumPrice` (client-side hint only — server re-enforces).
- Produces: `/post-a-job` route; `<PostJobForm categories={{id,name,minHourlyRate}[]} />`.

- [ ] **Step 1: Create `src/components/PostJobForm.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { minimumPrice } from "@/lib/rules";

type Category = { id: string; name: string; minHourlyRate: number };

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function PostJobForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    estimatedHours: "",
    price: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const category = categories.find((c) => c.id === form.categoryId);
  const hours = Number(form.estimatedHours);
  const minPrice = useMemo(
    () => (category && hours > 0 ? minimumPrice(category.minHourlyRate, hours) : null),
    [category, hours]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        estimatedHours: Number(form.estimatedHours),
        price: Number(form.price),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.push(`/jobs/${data.job.id}`);
    } else {
      setErrors(
        typeof data.error === "object" && data.error ? data.error : { form: [String(data.error ?? "Failed to post job")] }
      );
    }
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Job title</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
        {fieldError("title") && <p className="mt-1 text-sm text-red-600">{fieldError("title")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          required
          rows={6}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={inputCls}
          placeholder="Describe the work, deliverables, and any requirements (min 20 characters)"
        />
        {fieldError("description") && <p className="mt-1 text-sm text-red-600">{fieldError("description")}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Estimated hours</label>
          <input
            type="number" min="0.5" step="0.5" required
            value={form.estimatedHours}
            onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
            className={inputCls}
          />
          {fieldError("estimatedHours") && <p className="mt-1 text-sm text-red-600">{fieldError("estimatedHours")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price (USD)</label>
          <input
            type="number" min="1" step="0.01" required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={inputCls}
          />
          {fieldError("price") && <p className="mt-1 text-sm text-red-600">{fieldError("price")}</p>}
        </div>
      </div>
      {minPrice !== null && (
        <p className="rounded bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
          Minimum for <strong>{category!.name}</strong> at <strong>{hours}h</strong>: <strong>${minPrice}</strong>{" "}
          — you set the price, but it must meet the category minimum so freelancers apply.
        </p>
      )}
      {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
      <button disabled={busy} className="rounded bg-brand px-8 py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
        {busy ? "Posting…" : "Post Job"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create `src/app/post-a-job/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import PostJobForm from "@/components/PostJobForm";

export default async function PostAJobPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/post-a-job");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, minHourlyRate: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Post a Job</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Once you submit, your job is live to freelancers who can start applying.
        Payment is collected when you accept a freelancer (payments launch soon).
      </p>
      <div className="mt-8">
        <PostJobForm categories={categories} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Logged in, post a job in Development, 10 hours, price $50 → inline error showing the $150 minimum; price $200 → redirected to the new job's detail page (404 until Task 15 — the URL containing a new job id is the success signal; confirm with `curl.exe -s "http://localhost:3000/api/jobs?q=<your title>"`).

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: add post-a-job page with live minimum-price hint"
```

---

### Task 15: Job detail page with apply + applicant management

**Files:**
- Create: `src/components/ApplyForm.tsx`
- Create: `src/components/ApplicantActions.tsx`
- Create: `src/app/jobs/[id]/page.tsx`
- Test: manual two-account flow (verification step below)

**Interfaces:**
- Consumes: `auth`, `prisma`, `POST /api/jobs/[id]/apply` (Task 11), `PATCH /api/applications/[id]` (Task 11).
- Produces: `/jobs/[id]` route; `<ApplyForm jobId />`; `<ApplicantActions applicationId status />`.

- [ ] **Step 1: Create `src/components/ApplyForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverNote }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string" ? data.error : data.error?.coverNote?.[0] ?? "Could not submit application."
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-neutral-200 p-5">
      <h2 className="font-semibold text-brand">Apply for this job</h2>
      <textarea
        required
        rows={4}
        value={coverNote}
        onChange={(e) => setCoverNote(e.target.value)}
        placeholder="Tell the poster why you're the right fit (min 10 characters)"
        className="mt-3 w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="mt-3 rounded bg-brand px-6 py-2 font-medium text-white hover:bg-accent disabled:opacity-50">
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create `src/components/ApplicantActions.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: { status: "WISHLISTED" | "ACCEPTED" | "DENIED"; label: string; cls: string }[] = [
  { status: "WISHLISTED", label: "Wishlist", cls: "bg-accent text-white" },
  { status: "ACCEPTED", label: "Accept", cls: "bg-brand text-white" },
  { status: "DENIED", label: "Deny", cls: "bg-neutral-200 text-neutral-800" },
];

export default function ApplicantActions({ applicationId, status }: { applicationId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (status === "ACCEPTED" || status === "DENIED") {
    return <span className={`text-sm font-semibold ${status === "ACCEPTED" ? "text-brand" : "text-neutral-500"}`}>{status}</span>;
  }

  async function act(next: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Action failed.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "WISHLISTED" && <span className="text-xs font-semibold text-accent">WISHLISTED</span>}
      {ACTIONS.filter((a) => !(status === "WISHLISTED" && a.status === "WISHLISTED")).map((a) => (
        <button
          key={a.status}
          disabled={busy}
          onClick={() => act(a.status)}
          className={`rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${a.cls}`}
        >
          {a.label}
        </button>
      ))}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/jobs/[id]/page.tsx`**

```tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ApplyForm from "@/components/ApplyForm";
import ApplicantActions from "@/components/ApplicantActions";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/jobs/${id}`);

  const job = await prisma.job.findUnique({
    where: { id },
    include: { category: true, poster: { select: { id: true, displayName: true } } },
  });
  if (!job) notFound();

  const isPoster = job.posterId === session.user.id;
  const myApplication = isPoster
    ? null
    : await prisma.application.findUnique({
        where: { jobId_applicantId: { jobId: id, applicantId: session.user.id } },
      });
  const applications = isPoster
    ? await prisma.application.findMany({
        where: { jobId: id },
        include: { applicant: { select: { displayName: true, skills: true, hourlyRate: true, publicUserId: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand">{job.title}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {job.category.name} · ~{job.estimatedHours}h · posted by {job.poster.displayName}
          </p>
        </div>
        <div className="text-right">
          <p className="rounded bg-ink px-4 py-2 text-xl font-bold text-white">${job.price}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{job.status.replace("_", " ")}</p>
        </div>
      </div>

      <p className="mt-8 whitespace-pre-line leading-relaxed text-neutral-800">{job.description}</p>

      <div className="mt-10">
        {isPoster ? (
          <section>
            <h2 className="text-xl font-bold">Applications ({applications.length})</h2>
            {applications.length === 0 && (
              <p className="mt-3 text-neutral-500">No applications yet. Freelancers will see this job on Find Work.</p>
            )}
            <ul className="mt-4 space-y-4">
              {applications.map((a) => (
                <li key={a.id} className="rounded-xl border border-neutral-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{a.applicant.displayName}</p>
                      <p className="text-xs text-neutral-500">
                        {a.applicant.publicUserId} · ${a.applicant.hourlyRate}/h · {a.applicant.skills || "no skills listed"}
                      </p>
                    </div>
                    <ApplicantActions applicationId={a.id} status={a.status} />
                  </div>
                  <p className="mt-3 text-sm text-neutral-700">{a.coverNote}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : myApplication ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="font-medium">
              You applied on {myApplication.createdAt.toLocaleDateString()} — status:{" "}
              <span className="font-bold text-brand">{myApplication.status}</span>
            </p>
            {myApplication.status === "ACCEPTED" && (
              <p className="mt-2 text-sm text-neutral-600">
                Congratulations! You'll coordinate the work through Goodturn Connect (coming soon).
              </p>
            )}
          </div>
        ) : job.status === "OPEN" ? (
          <ApplyForm jobId={job.id} />
        ) : (
          <p className="rounded-xl bg-neutral-100 p-5 text-neutral-600">This job is no longer open for applications.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify the full two-account flow**

1. Log in as `bob@example.com` / `demo1234` → open the seeded "Landing page redesign" job (posted by Alice per the seed) → submit an application with a cover note → page refreshes showing "You applied … status: PENDING".
2. Log out, log in as `alice@example.com` → open the same job → Bob's application appears with Wishlist / Accept / Deny → click Accept → status shows ACCEPTED and the job header shows IN PROGRESS.
3. Back as Bob: the job detail shows status ACCEPTED with the congratulations note.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add job detail page with apply flow and applicant management"
```

---

### Task 16: Account and Profile pages

**Files:**
- Create: `src/components/BalanceCard.tsx`
- Create: `src/components/ProfileForm.tsx`
- Create: `src/app/account/page.tsx`
- Create: `src/app/profile/page.tsx`
- Test: visual check + `npm run build`

**Interfaces:**
- Consumes: `auth`, `prisma`, `PATCH /api/profile` (Task 12), `<ComingSoon>` (Task 7).
- Produces: `/account` and `/profile` routes; `<BalanceCard balance={number} />` (show/hide toggle); `<ProfileForm user={{displayName,bio,skills,hourlyRate}} />`.

- [ ] **Step 1: Create `src/components/BalanceCard.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function BalanceCard({ balance }: { balance: number }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">
        Account Balance:{" "}
        <strong>{visible ? `$${balance.toFixed(2)}` : "$ ••••"}</strong>
      </span>
      <button
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide balance" : "Show balance"}
        className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ProfileForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileData = { displayName: string; bio: string; skills: string; hourlyRate: number };

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function ProfileForm({ user }: { user: ProfileData }) {
  const router = useRouter();
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hourlyRate: Number(form.hourlyRate) }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors(typeof data.error === "object" && data.error ? data.error : { form: ["Could not save profile."] });
    }
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Display name</label>
        <input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputCls} />
        {fieldError("displayName") && <p className="mt-1 text-sm text-red-600">{fieldError("displayName")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Skills (comma-separated — used by Find Best Match)</label>
        <input
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="e.g. writing, react, design"
          className={inputCls}
        />
        {fieldError("skills") && <p className="mt-1 text-sm text-red-600">{fieldError("skills")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Hourly rate (USD)</label>
        <input
          type="number" min="0" step="0.5"
          value={form.hourlyRate}
          onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })}
          className={inputCls}
        />
        {fieldError("hourlyRate") && <p className="mt-1 text-sm text-red-600">{fieldError("hourlyRate")}</p>}
      </div>
      {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
      {saved && <p className="text-sm font-medium text-green-700">Profile saved.</p>}
      <button disabled={busy} className="rounded bg-brand px-8 py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `src/app/account/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import BalanceCard from "@/components/BalanceCard";
import ComingSoon from "@/components/ComingSoon";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const myApplications = await prisma.application.findMany({
    where: { applicantId: user.id },
    include: { job: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  const jobsPosted = await prisma.job.findMany({
    where: { posterId: user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="rounded-3xl border border-neutral-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand">User ID: {user.publicUserId}</h1>
            <p className="mt-1 max-w-sm text-sm font-medium text-neutral-700">
              This is the ID you will be asked for when trying to connect with Job Owners on our Goodturn
              Connect Platform.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <BalanceCard balance={user.accountBalance} />
            <ComingSoon
              label="Withdraw"
              note="Payments launch soon — withdrawals will be available then."
              className="rounded bg-ink px-6 py-2.5 font-medium text-white hover:bg-neutral-700"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-brand p-8 text-white">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <h3 className="mt-4 text-lg">Your Payment Info</h3>
        <p className="mt-4 text-neutral-200">View Current Payment Information</p>
        <p className="mt-2 text-neutral-200">Manage Payment Method</p>
        <p className="mt-4 rounded bg-white/10 px-4 py-3 text-sm">
          Payments launch soon. You'll be able to link Visa, Mastercard, PayPal, Mpesa and Crypto Wallets here.
        </p>
      </section>

      <section id="my-applications" className="mt-10">
        <h2 className="text-xl font-bold">My Job Applications</h2>
        {myApplications.length === 0 ? (
          <p className="mt-3 text-neutral-500">
            You haven't applied to any jobs yet. <Link href="/find-work" className="text-brand underline">Find work</Link>.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {myApplications.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-4 py-3">
                <Link href={`/jobs/${a.job.id}`} className="font-medium text-brand hover:underline">{a.job.title}</Link>
                <span className="text-sm font-semibold text-neutral-600">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="jobs-posted" className="mt-10">
        <h2 className="text-xl font-bold">Jobs I Posted</h2>
        {jobsPosted.length === 0 ? (
          <p className="mt-3 text-neutral-500">
            You haven't posted any jobs yet. <Link href="/post-a-job" className="text-brand underline">Post a job</Link>.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {jobsPosted.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-4 py-3">
                <Link href={`/jobs/${j.id}`} className="font-medium text-brand hover:underline">{j.title}</Link>
                <span className="text-sm text-neutral-600">
                  {j._count.applications} application{j._count.applications === 1 ? "" : "s"} · {j.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10">
        <Link href="/profile" className="font-medium text-brand underline">Edit my profile →</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/app/profile/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { displayName: true, bio: true, skills: true, hourlyRate: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">My Profile</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Your skills power the Find Best Match ranking — keep them current.
      </p>
      <div className="mt-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

`/account` (as Alice) shows her `GT-…` User ID, hidden balance that reveals on Show, Withdraw → coming-soon note, her seeded application under My Job Applications, and her posted jobs with application counts. `/profile` edits save and survive refresh.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: add account dashboard and profile editor"
```

---

### Task 17: Final verification, README, and wrap-up

**Files:**
- Create: `README.md` (replace scaffold README)
- Test: full suite + build + manual smoke pass

**Interfaces:**
- Consumes: everything.
- Produces: documented, verified build.

- [ ] **Step 1: Run the full test suite and build**

```powershell
$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"
npm test
npm run build
```

Expected: all Vitest suites pass (ids, rules, match, validation, jobs-query); build succeeds with all routes listed.

- [ ] **Step 2: Manual smoke pass (dev server)**

Walk through as a new visitor: home → how-it-works → contact (send message) → signup (new account) → post a job (see minimum-price hint + enforcement) → second browser/incognito as `bob@example.com` → find work → search + match → apply → back as new account → accept Bob → job IN_PROGRESS → account page shows both sides. Check mobile width (hamburger, stacked sections).

- [ ] **Step 3: Replace `README.md`**

```markdown
# Goodturn

Goodturn Company Limited — freelance work platform: **Goodturn Jobs** (live),
**Goodturn Connect** and **Goodturn Learn** (coming soon).

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Prisma + SQLite ·
Auth.js (credentials) · Zod · Vitest

## Getting started

Requires Node.js ≥ 18.18 (tested on 22.x).

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npm run db:seed          # categories + demo data
npm run dev              # http://localhost:3000
```

Create `.env.local` with `AUTH_SECRET=<any long random string>` (generate:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

## Demo accounts

`alice@example.com`, `bob@example.com`, `carol@example.com` — password `demo1234`.

## Scripts

- `npm run dev` — dev server
- `npm test` — Vitest unit tests (business rules, validation, matching)
- `npm run build` — production build
- `npm run db:migrate` / `npm run db:seed` — database

## Roadmap (later phases)

Payments & escrow (Visa/Mastercard/PayPal/Mpesa/crypto), Goodturn Connect
messaging, Goodturn Learn courses, forum, AI matching. See
`docs/superpowers/specs/2026-07-14-goodturn-website-design.md`.
```

- [ ] **Step 4: Final commit**

```powershell
git add -A
git commit -m "docs: add README with setup, demo accounts, and roadmap"
git log --oneline
```

Expected: a clean history of one commit per task.



