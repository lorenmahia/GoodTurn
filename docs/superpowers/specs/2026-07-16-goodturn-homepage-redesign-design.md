# Goodturn Homepage Redesign — Design Spec

Date: 2026-07-16
Status: Approved by user (2026-07-16)
Supersedes: the `/` row of `docs/superpowers/specs/2026-07-14-goodturn-website-design.md`

## Overview

The current homepage (`src/app/page.tsx`, 178 lines) reads as a plain
brochure: four flat sections, ~1.5 viewports of scroll, no imagery, no motion.
It does not communicate "professional service."

This redesign rebuilds `/` as a **cinematic layered-scroll page**: roughly
5–6 viewport heights of tall, generous segments, each revealing with 3D
depth as it enters the viewport, built on real photography and layered
parallax.

Two constraints drive every decision below:

1. **Demand side is the bottleneck.** Goodturn Jobs — specifically the
   *client* pitch — gets the hero, the primary CTA, and roughly half the
   page. Learn and Connect are compressed to slim supporting bands.
2. **Zero new dependencies.** No animation library. IntersectionObserver +
   CSS 3D transforms only.

**Scope:** `/` only. No other page, route, API, or test changes behavior.
No schema changes.

## Non-goals

- Redesigning Navbar, Footer, or any other page.
- Changing any factual claim about the product. Copy is rewritten and
  expanded, but the three-business structure and every claim (in-app
  specialists, AI matching, minimum price, payment methods, Connect/Learn
  coming soon) carries over from the approved 2026-07-14 spec.
- Inventing social proof. No fake testimonials, logos, or user counts.
- Adding a CMS or making copy data-driven. Copy stays in the component.

## Page architecture

`/` stays a **server component**. Only the small motion wrappers are client
components. Sequence, top to bottom:

| # | Segment | Height | Purpose |
|---|---|---|---|
| 1 | `HeroSection` | 100vh | Client-first pitch, parallax photo + mountains, Post a Job |
| 2 | `StatsBand` | ~50vh | Real numbers from the DB + value tiles |
| 3 | `ForClientsSection` | ~150vh | **Flagship.** Vetted talent, AI matching, You Set the Price |
| 4 | `HowItWorksStrip` | ~60vh | Post → Review → Accept, 3 revealing steps |
| 5 | `ForFreelancersSection` | ~100vh | Supply side: match, payments, Learn |
| 6 | `LearnSection` | ~70vh | Slimmed; keeps both existing columns |
| 7 | `ConnectSection` | ~60vh | Slim preview + Coming Soon |
| 8 | `FinalCtaBand` | ~60vh | Full-width photo: "Post your first job today" |

Total ≈ 6.5 viewports desktop — comfortably past the "two full pages"
requirement. Segments 2–5 (Jobs) are ~55% of total scroll.

### File layout

`src/app/page.tsx` at ~178 lines already holds four components. The redesign
roughly triples the content, so sections move out rather than growing one
file to ~700 lines:

```
src/app/page.tsx                    server component; data fetch + compose
src/components/home/HeroSection.tsx
src/components/home/StatsBand.tsx
src/components/home/ForClientsSection.tsx
src/components/home/HowItWorksStrip.tsx
src/components/home/ForFreelancersSection.tsx
src/components/home/LearnSection.tsx
src/components/home/ConnectSection.tsx
src/components/home/FinalCtaBand.tsx
src/components/motion/Reveal.tsx      "use client"
src/components/motion/ParallaxLayer.tsx "use client"
src/components/motion/CountUp.tsx     "use client"
```

`src/components/home/` is new but consistent with the existing flat
`src/components/` convention — it is a namespace for page-specific pieces,
not a new architectural layer. Section components are presentational and
take props only where they need data (`StatsBand`).

## Motion system

Three client components. Everything else is CSS.

### `Reveal`

```tsx
type RevealProps = {
  children: React.ReactNode;
  variant?: "fade-up" | "tilt" | "left" | "right" | "zoom"; // default "fade-up"
  delay?: number;      // ms, for stagger; default 0
  className?: string;
};
```

Wraps children in a `div`. On mount, an `IntersectionObserver`
(`threshold: 0.15`, `rootMargin: "0px 0px -10% 0px"`) adds a
`data-revealed="true"` attribute the first time the element intersects, then
**unobserves** — reveal is one-way, so scrolling back up does not re-animate
(re-animation on every pass reads as jittery, not premium).

Hidden state and per-variant transforms live in `globals.css`, keyed off
`[data-reveal]` / `[data-revealed]`. The 3D feel comes from a `perspective`
on the wrapper plus `rotateX` / `translateZ` on the child:

- `fade-up` — `opacity: 0; translateY(28px)` → settle
- `tilt` — `perspective(1000px) rotateX(12deg) translateZ(-60px)` → flat
- `left` / `right` — `translateX(∓48px)` + slight `rotateY`
- `zoom` — `scale(1.08)` → `1` (used on photos, so they settle into frame)

Transition: `700ms cubic-bezier(0.22, 1, 0.36, 1)`, `delay` applied inline.

**Stagger** is caller-driven: card grids pass `delay={i * 90}`.

### `ParallaxLayer`

```tsx
type ParallaxLayerProps = {
  speed: number;        // 0 = fixed, 1 = scrolls with page; hero uses 0.15–0.6
  children: React.ReactNode;
  className?: string;
};
```

Subscribes to a single shared scroll listener (`passive: true`), batches
into one `requestAnimationFrame` per frame, and writes
`transform: translate3d(0, ${offset}px, 0)` directly to the node — **no
React state per frame**, so scrolling never re-renders the tree.

Used only in `HeroSection` and `FinalCtaBand`. Layers, back to front:
photo (speed 0.15) → gradient scrim (0.3) → mountain SVGs (0.45) → headline
+ CTAs (0.6). Different speeds are what produce genuine depth rather than a
background image that just sits there.

### `CountUp`

```tsx
type CountUpProps = { to: number; suffix?: string; durationMs?: number };
```

Renders `to` as static text until it first intersects, then eases from 0 to
`to` over ~1200ms via `requestAnimationFrame`. **SSR renders the final
value**, so no-JS and pre-hydration both show the real number, never `0`.

## Data: the stats band

The band shows real numbers, queried in the server component:

```ts
import { prisma } from "@/lib/db";

const [openJobs, categories, members] = await Promise.all([
  prisma.job.count({ where: { status: "OPEN" } }),
  prisma.category.count(),
  prisma.user.count(),
]);
```

Rendered as: **Open jobs**, **Skill categories**, **Members**. The third is
*Members*, not *Freelancers* — confirmed by the user, and correct on the
data besides: `User` has no client/freelancer split (anyone can post or
apply), so labelling that count "freelancers" would be a claim the schema
does not support. The word "freelancer" is still used freely in prose and
headings, where it is accurate; it is only barred as a label on this count.
Three
non-numeric value tiles sit alongside: "You set the price", "AI-matched
applicants", "Global payments — Visa, Mastercard, PayPal, Mpesa, crypto".

**Caching:** `/` is currently statically prerendered. Adding this query
makes it dynamic unless we opt into revalidation, so the page declares:

```ts
export const revalidate = 3600;
```

The page stays prerendered and fast; stats refresh hourly. Counts this
small do not justify a DB hit per visitor.

**Empty-DB honesty:** on a fresh database these read 0. Rather than hide
that, labels are framed so small numbers still read as truthful and the
band never claims scale it doesn't have. If a count is 0 the tile renders
the number plainly — no "—", no fake floor.

## Photography

6 photos, downloaded to `public/images/home/`. **No hotlinking** — the site
must not depend on an external CDN at runtime.

| File | Subject | Used by |
|---|---|---|
| `hero.jpg` | Diverse professional team collaborating | HeroSection |
| `client-review.jpg` | Client reviewing work on a laptop | ForClientsSection |
| `pricing.jpg` | Focused planning / whiteboard moment | ForClientsSection (price card) |
| `freelancer.jpg` | Freelancer at a workstation | ForFreelancersSection |
| `learn.jpg` | Person learning / studying | LearnSection |
| `cta.jpg` | Wide, warm team environment | FinalCtaBand |

**Licensing:** Pexels only — free for commercial use, no attribution
required, no signup. Each source URL is recorded in
`public/images/home/CREDITS.md` for provenance even though attribution is
not required. Files are resized to ≤ 1920px wide and re-encoded to keep the
repo reasonable (target ≤ 300 KB each; hero may reach ~400 KB).

**Rendering:** `next/image` throughout.
- `hero.jpg` gets `priority` and `sizes="100vw"` — it is the LCP element.
- All others lazy-load by default with explicit `sizes`.
- Photos behind text always sit under a gradient scrim
  (`from-ink/85 via-ink/60 to-brand/40` or similar) so contrast holds
  regardless of the photo. Text is never placed directly on a raw photo.
- Every image gets descriptive `alt`; decorative layers get `alt=""` and
  `aria-hidden`.

## Visual system

Unchanged tokens: `--color-brand #3B4A8C`, `--color-accent #7B6FD0`,
`--color-charcoal #2E2E2E`, `--color-ink #0A0A0F`. The redesign adds no new
palette entries; depth comes from opacity, scrim gradients, and shadow.

Motion keyframes and `[data-reveal]` rules are added to `globals.css`
alongside the existing `@theme` block (Tailwind v4 is CSS-first here; there
is no `tailwind.config.js` to extend).

Section rhythm alternates: dark (hero) → ink (stats) → white (clients) →
tinted (how it works) → white (freelancers) → brand indigo (learn) → white
(connect) → dark photo (CTA). The alternation is what makes a 6-viewport
page feel like chapters instead of a scroll marathon.

## Copy

Rewritten and expanded, client-first. Full text is written during
implementation; the spec fixes the structure and the claims:

- **Hero:** eyebrow "Goodturn Jobs" · H1 leads with hiring vetted freelance
  talent · one supporting paragraph naming all three businesses · primary
  **Post a Job**, ghost secondary **Find Work** · scroll cue.
- **For Clients:** three expanded blocks — *Large, high-quality freelancer
  skillset* (+ in-app specialists, learn-with-us readiness), *Matched by AI,
  ranked by certification* (screening on education + skills, certificates
  boost ranking), *You set the price* (with the per-category,
  hours × complexity minimum explained as fairness, not a fee).
- **How it works:** Post a job and enter details → Receive and filter
  applications → Accept and work begins. Links to `/how-it-works`.
- **For Freelancers:** Find Best Match, fast global payment (Visa,
  Mastercard, PayPal, Mpesa, crypto; secure checkout), grow through Learn.
- **Learn / Connect:** existing copy, tightened; Connect keeps the Account
  ID note and `ComingSoon`.

All apostrophes in JSX text must be `&apos;` — `react/no-unescaped-entities`
fails the build otherwise (hit twice during the initial build).

## Accessibility and degradation

Non-negotiable: **the page is fully readable with JS disabled.** This
constrains the implementation in a specific way worth stating outright:

The server-rendered HTML must contain the content in its **visible** state
(no `opacity: 0` in the markup), otherwise a no-JS visitor gets a blank
page — the classic failure of scroll-reveal sites. So `Reveal` renders
without the hidden attribute, and the client applies it on mount.

That ordering creates a flash risk for JS users: content paints visible,
then snaps hidden to animate. `Reveal` therefore sets its hidden state in
**`useLayoutEffect`**, which runs synchronously before the browser paints,
so the hidden state lands in the same frame and no flash is visible.
`useEffect` fires *after* paint and would show the flash — this is not
interchangeable.

Result: no-JS sees a complete static page; JS sees a clean animation; neither
sees a blank or a flicker.

- `prefers-reduced-motion: reduce` — a single `@media` block in `globals.css`
  sets all reveal transitions to `none` and forces the revealed state;
  `ParallaxLayer` checks the media query and skips its listener entirely;
  `CountUp` renders the final number without animating.
- Headings stay a correct hierarchy: one `h1` (hero), `h2` per segment.
- Contrast: all text over photos sits on a scrim, verified ≥ 4.5:1.
- Focus order is DOM order; no motion wrapper is focusable.
- Scroll-cue chevron is `aria-hidden`.

## Testing

The existing suite is 37 Vitest unit tests over pure logic (`ids`, `rules`,
`match`, `validation`, `jobs-query`) — there is no component-test harness
(no jsdom, no Testing Library), and this redesign is presentational.
**Adding a component-test stack is out of scope**; introducing one would be
a larger change than the feature.

Verification instead:

1. `npm test` — 37/37 still green (proves no logic regression).
2. `npm run build` — exit 0, `/` still listed as prerendered with
   `revalidate`.
3. **Browser pass** at 1440px and 390px: all 8 segments reveal on scroll,
   hero parallax has visible depth, no horizontal overflow at 390px, photos
   load, CTAs route correctly (`/post-a-job`, `/find-work`, `/how-it-works`,
   `/learn`, `/contact`).
4. **Degradation pass:** JS disabled → full page readable, all content
   visible. `prefers-reduced-motion` forced → no transforms, content visible.
5. Stats reflect the seeded DB (not zeros, not hardcoded).

## Risks

- **Scroll jank** from too many animated layers. Mitigated by
  transform/opacity only (no layout-triggering properties), one shared rAF
  scroll loop, and parallax confined to two segments.
- **Page weight** from 6 photos. Mitigated by `next/image` (lazy + responsive
  variants), only the hero eager, and per-file size budgets.
- **Long page hurting the CTA.** Mitigated by Post a Job appearing three
  times: hero, clients section, final band.

## Delivery

Work happens on a local `homepage-redesign` branch off `master`, never on
`master` directly.

There is **no GitHub remote** — the repo is local-only, and `gh` is not
installed (nor is `winget`). By user decision, GitHub is deferred: the
branch is reviewed locally. Commits are therefore kept PR-shaped (one
logical step each, per the work plan below) so the branch can be pushed and
opened as a pull request later with no rewriting. When that happens, the
route is: create an empty private repo → `git remote add origin` →
`git push` (Git Credential Manager is already configured and will handle
auth) → open the GitHub compare URL in a browser.

## Work plan

1. Motion primitives + `globals.css` rules (`Reveal`, `ParallaxLayer`, `CountUp`).
2. Download, resize, and commit photos + `CREDITS.md`.
3. Hero + stats band (server query + `revalidate`).
4. For Clients + How it works strip.
5. For Freelancers.
6. Learn + Connect + final CTA band.
7. Compose in `page.tsx`; delete the old inline sections.
8. Verify: tests, build, browser pass, degradation pass.

Steps 3–6 are independently reviewable and each leave the page working.
