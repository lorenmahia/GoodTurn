# Goodturn Website — Design Spec

Date: 2026-07-14
Status: Approved by user (sections 1–3 approved in conversation)

## Overview

Goodturn Company Limited is a freelance-work platform with three businesses:
**Goodturn Jobs** (post and find work), **Goodturn Connect** (client–freelancer
communication), and **Goodturn Learn** (certificates and paid teaching).

This build delivers the full website from the approved Bubble prototype
(`sample_webpage_recording.mp4` in the repo root), with **real** auth, job
posting, applications, search/matching, and profiles. Payments/wallet,
Connect chat, and Learn are visible but stubbed, to be built in later phases.

Visual fidelity: keep the prototype's layout, section order, and copy;
polish spacing, typography, and color consistency to production grade.

## Architecture

- **One Next.js (App Router, TypeScript) application** — frontend pages and
  backend API routes in a single project at the repo root.
- **Prisma + SQLite** (`dev.db`) — zero-setup local database; schema designed
  to migrate to Postgres later without model changes.
- **Auth.js** — email + password (bcrypt), JWT session cookie, middleware
  guarding logged-in routes.
- **Tailwind CSS** for styling.
- **Zod** for input validation on every API route.
- **Vitest** for tests.

## Pages

### Public

| Route | Content |
|---|---|
| `/` | Dark charcoal navbar (eagle logo, Home, Find Work, Post a Job, Learn, Account, Sign up/Log in, hamburger on mobile). Mountain hero: "We Connect" + "Freelancers, Businesses and Industry Experts" + three-business intro paragraph + Contact us button. Goodturn Jobs section: "To Clients" (Large and High Quality Freelancer Skillset; High Quality Work; You Set the Price dark card) and "To Freelancers" (Fast Payment System; Post a Job / Find Work / How it Works buttons). Goodturn Learn indigo panel: "Want to Learn…" / "Already an Expert…" + Go to Learn Page button. Goodturn Connect section: video/call/chat/SMS copy, auto-login note, Go to Connect button. Black footer: logo, "Goodturn Company", columns Read and Learn (Our User Guide, Reference Library, News), Connect and Ask (Goodturn Forum, Trusted Agencies, FAQ's), Bookmark and Follow (Instagram, Twitter, Blog); bottom bar: Copyright, About the Company, Terms and conditions, Reset password. |
| `/how-it-works` | "The Post A Job Workflow": numbered steps — 1) Post a job and enter details (pay upfront or on accept, refundable), 2) Receive Applications (filter; wishlist/deny/accept), 3) Submission Requests (completion request as contract; rate workers), 4) Completion & payment release. |
| `/learn` | "Page Under Construction" placeholder styled to match the site (per prototype). |
| `/contact` | Contact form (name, email, message) → saved to DB. |
| `/signup`, `/login` | Auth pages. |

### Logged-in

| Route | Content |
|---|---|
| `/find-work` | Keyword search + category dropdown + "More filters" (price range, sort). Job cards. "Find Best Match" button (skill-overlap ranking). Quick Links sidebar: My Jobs, My Profile, Jobs I Posted, Withdraw Funds. |
| `/post-a-job` | Form: title, description, category, estimated hours, price. Shows per-category minimum price hint; server enforces it. |
| `/jobs/[id]` | Job detail + Apply (cover note). Poster additionally sees applicant list with Wishlist / Accept / Deny actions. |
| `/account` | User ID card (publicUserId, "for Goodturn Connect"), Account Balance with show/hide toggle, Withdraw button (stub), tabs: Payment and Billing (stub), My Profile, My Job Applications. |
| `/profile` | Edit display name, bio, skills, hourly rate. |

Floating chat bubble (bottom-right, all pages) opens a "Goodturn Connect is
coming soon" panel.

## Visual system

- Navbar/footer: dark charcoal `#2E2E2E` / black `#0A0A0F`.
- Primary brand indigo `#3B4A8C` (hero buttons, Learn panel).
- Accent purple `#7B6FD0` (secondary buttons e.g. How it Works, More filters).
- Black emphasis cards (You Set the Price, Post a Job CTA).
- White content background; near-black headings; indigo section subheads.
- Goodturn eagle logo (SVG recreation: blue eagle mark + "Goodturn" wordmark).
- Responsive: hamburger menu on mobile; sections stack single-column.

## Data model (Prisma)

- **User**: id, email (unique), passwordHash, displayName, bio, skills
  (comma-separated string), hourlyRate, accountBalance (default 0),
  publicUserId (short unique code), createdAt.
- **Category**: id, name (unique), minHourlyRate. Seeded starter list
  (Writing, Design, Development, Data Entry, Marketing, …).
- **Job**: id, title, description, categoryId → Category, estimatedHours,
  price, status (`OPEN` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`),
  posterId → User, createdAt. Rule: price ≥ category.minHourlyRate ×
  estimatedHours.
- **Application**: id, jobId → Job, applicantId → User, coverNote, status
  (`PENDING` | `WISHLISTED` | `ACCEPTED` | `DENIED`), createdAt.
  Unique (jobId, applicantId).
- **ContactMessage**: id, name, email, message, createdAt.

Dual-role accounts: "Jobs I Posted" = jobs with posterId = me;
"My Jobs" = jobs where my application is ACCEPTED. No role tables.

## API routes

| Route | Behavior |
|---|---|
| `POST /api/signup` | Create account (email, password, displayName); bcrypt hash; then client signs in via Auth.js. |
| `POST /api/auth/*` | Auth.js login/logout/session (credentials provider). |
| `GET /api/jobs` | Search: `q`, `category`, `minPrice`, `maxPrice`, `sort` (`newest` default, `price-asc`, `price-desc`). Open jobs only by default. |
| `POST /api/jobs` | Create job; enforce category price minimum. |
| `GET /api/jobs/[id]` | Detail; include applications only for the poster. |
| `POST /api/jobs/[id]/apply` | Apply with cover note. Reject if poster = applicant, duplicate, or job not OPEN. |
| `PATCH /api/applications/[id]` | Poster-only status change. ACCEPTED → job becomes IN_PROGRESS. |
| `GET /api/match` | Rank OPEN jobs by overlap of user's skills vs job title/category keywords; simple scoring now, real AI later. |
| `GET/PATCH /api/profile` | Own profile read/update. |
| `POST /api/contact` | Save contact message. |

## Validation & error handling

- Zod schemas on all route inputs. 400 invalid, 401 unauthenticated,
  403 not owner, 404 missing.
- Forms show inline field errors; unexpected errors show a toast.
- Middleware redirects unauthenticated users from protected pages to `/login`.

## Stubs (later phases)

- **Payments/wallet**: balance displays (0 default), Withdraw and payment
  method screens show "Payments launch soon". No money movement.
- **Connect**: chat bubble + Go to Connect → "coming soon" panel.
- **Learn**: under-construction page.
- **Password reset / email verification**: deferred (needs email service);
  footer link shows contact-support placeholder.
- Stubs are isolated components so real services can replace them without
  touching core code.

## Seed data

Seed script: categories with minimum rates, 3 demo users
(password: `demo1234`), ~8 open jobs across categories, a few applications.

## Testing

- Vitest unit tests: price-minimum rule, application state transitions,
  duplicate/self-apply guards, match ranking, auth guards on API routes.
- Smoke: `next build` succeeds; key pages render.
- Run: `npm test`.

## Out of scope (later phases)

Real payments (Visa/Mastercard/PayPal/Mpesa/crypto, escrow, withdrawals),
Goodturn Connect messaging (video/call/chat/SMS, Workstation), Goodturn Learn
(courses, certificates, teaching payouts), forum, news/blog, trusted agencies,
AI matching model, email sending, admin dashboard.
