# Goodturn Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/` as a cinematic layered-scroll page — ~6.5 viewports of tall segments with 3D scroll reveals, real photography, and parallax depth — that sells Goodturn Jobs to clients first.

**Architecture:** `/` stays a server component that queries three counts and composes eight presentational section components from `src/components/home/`. All motion is three small client components in `src/components/motion/` (`Reveal`, `ParallaxLayer`, `CountUp`) driving CSS 3D transforms defined in `globals.css`. No animation library. Content is server-rendered visible, so the page degrades to a complete static document without JS.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (CSS-first `@theme`) · Prisma (SQLite) · `next/image` · IntersectionObserver + `requestAnimationFrame`

**Spec:** `docs/superpowers/specs/2026-07-16-goodturn-homepage-redesign-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Zero new dependencies.** Do not run `npm install`. No animation library. `package.json` must be unchanged at the end.
- **Branch:** all work happens on `homepage-redesign`, branched from `master`. Never commit to `master`.
- **Scope:** `/` only. Do not modify any other page, route, API, component outside `src/components/home/` and `src/components/motion/`, the Prisma schema, or any existing test.
- **Apostrophes in JSX text must be `&apos;`.** `react/no-unescaped-entities` fails `npm run build` on a raw `'`. This broke the build twice during the initial site build. Applies to text nodes only, not to `className` or JS strings.
- **Brand tokens are fixed:** `--color-brand #3b4a8c`, `--color-accent #7b6fd0`, `--color-charcoal #2e2e2e`, `--color-ink #0a0a0f`. Add no new palette entries; get depth from opacity, scrim gradients, and shadow. Use them as Tailwind classes (`bg-brand`, `text-accent`, `bg-ink`).
- **No invented social proof.** No testimonials, client logos, or made-up counts. Numbers come from the database or are not shown.
- **The user count is labelled "Members", never "Freelancers".** `User` has no client/freelancer split. The word "freelancer" is fine in prose and headings.
- **No hotlinking.** Every image is a committed file under `public/images/home/`. No remote `src`, no `next.config.ts` `images.remotePatterns`.
- **No JS = full page.** Server-rendered HTML must contain content in its visible state. Never ship `opacity: 0` in SSR markup.
- **Node:** prefix commands with the project's Node 22 path if `node -v` is below 18.18:
  `$env:Path = "$env:USERPROFILE\node22\node-v22.12.0-win-x64;$env:Path"`
- **Do not commit:** `dev.db`, `node_modules`, `.next`, `.superpowers/`, `.claude/`, `*.log`, `sample_webpage_recording.mp4`. Stage named files (`git add <paths>`), never `git add -A`.

## Testing Approach — read this before Task 1

This project has **no component-test harness** — no jsdom, no Testing Library. The 37 existing Vitest tests cover pure logic only (`ids`, `rules`, `match`, `validation`, `jobs-query`). Adding a component-test stack is explicitly out of scope per the spec; it would be a larger change than the feature.

**Therefore these tasks are not TDD.** Do not invent component tests. Do not add jsdom. The verification contract for every task is:

1. `npm test` → **37 passed** (proves no logic regression), and
2. `npm run build` → **exit 0** (proves types, lint, and prerendering are intact), and
3. the task's own explicit browser or output check.

A task is only done when its stated commands produce the stated output. Never report a task complete on the strength of "it should work."

## File Structure

| File | Responsibility |
|---|---|
| `src/app/page.tsx` | **Modify.** Server component: counts query, `revalidate`, composes sections. Ends ~35 lines; all current inline sections are deleted. |
| `src/app/globals.css` | **Modify.** Append reveal/parallax CSS + reduced-motion block below the existing `@theme`. |
| `src/components/motion/Reveal.tsx` | **Create.** Client. IntersectionObserver → `data-revealed`. |
| `src/components/motion/ParallaxLayer.tsx` | **Create.** Client. Shared rAF scroll loop → `translate3d`. |
| `src/components/motion/CountUp.tsx` | **Create.** Client. Eased 0→N on first intersect. |
| `src/components/home/HeroSection.tsx` | **Create.** 100vh parallax hero. |
| `src/components/home/StatsBand.tsx` | **Create.** Takes counts as props; renders `CountUp` + value tiles. |
| `src/components/home/ForClientsSection.tsx` | **Create.** Flagship client pitch (~150vh). |
| `src/components/home/HowItWorksStrip.tsx` | **Create.** Three numbered steps. |
| `src/components/home/ForFreelancersSection.tsx` | **Create.** Supply-side pitch. |
| `src/components/home/LearnSection.tsx` | **Create.** Slimmed Learn band. |
| `src/components/home/ConnectSection.tsx` | **Create.** Slim Connect preview. |
| `src/components/home/FinalCtaBand.tsx` | **Create.** Closing photo CTA. |
| `public/images/home/*.jpg` | **Create.** Six committed photos. |
| `public/images/home/CREDITS.md` | **Create.** Source URL + photographer per photo. |

Section components are presentational; only `StatsBand` takes data. Each stays well under 150 lines.

## Deviation from the spec — parallax speeds (read before Task 2)

The spec lists hero layer speeds of photo `0.15` → scrim `0.3` → mountains `0.45` → headline `0.6`, where `speed` is the fraction of normal page speed the layer travels at (`0` = pinned, `1` = scrolls normally). The offset that produces is `y * (1 - speed)`.

Those numbers are **geometrically unbuildable as written**. At `speed = 0.15`, the photo layer is translated down by `0.85 × scrollY`. By the time the hero has scrolled one viewport, the photo has shifted 85vh — it would need ~185vh of height to still cover the hero, and anything less leaves a visible gap at the top of the frame.

**This plan therefore uses speeds tuned to the overflow each layer actually has**, preserving the spec's intent (back layers drift slowest, front layers track the page) while staying covered:

| Layer | Spec | This plan | Container overflow |
|---|---|---|---|
| Photo | 0.15 | **0.5** | `h-[150%]` → max offset 50vh, exactly covered |
| Scrim | 0.3 | **0.5** | shares the photo container |
| Mountains | 0.45 | **0.7** | `h-[130%]`, anchored bottom |
| Headline | 0.6 | **0.85** | no overflow needed; moves up slightly faster |

The depth ordering — and so the effect — is unchanged. Final values are tuned by eye during Task 9's browser pass; these are the safe starting point.

---

### Task 1: Branch, motion CSS, and the `Reveal` component

**Files:**
- Modify: `src/app/globals.css` (append below the existing `@theme` block)
- Create: `src/components/motion/Reveal.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `export default function Reveal(props: RevealProps)` and `export type RevealVariant = "fade-up" | "tilt" | "left" | "right" | "zoom"`. `RevealProps = { children: React.ReactNode; variant?: RevealVariant; delay?: number; className?: string }`. Every later task wraps content in `<Reveal>`.

- [ ] **Step 1: Create the branch**

```powershell
git checkout master
git status --short
git checkout -b homepage-redesign
git branch --show-current
```

Expected: `git status --short` prints nothing (clean tree). Final command prints `homepage-redesign`. If the tree is not clean, stop and report — do not stash or discard.

- [ ] **Step 2: Append the motion CSS to `src/app/globals.css`**

Append to the end of the file. Do not modify the existing `@import`, `@theme`, or `body` rules.

```css

/* ---------- Scroll reveal ----------
   Hidden states key off [data-revealed="false"], which only the client sets.
   Server-rendered markup has no data-revealed attribute, so it renders
   VISIBLE — a no-JS visitor gets the full page, not a blank one. */

[data-reveal] {
  transition:
    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

[data-reveal][data-revealed="false"] {
  opacity: 0;
}

[data-reveal="fade-up"][data-revealed="false"] {
  transform: translateY(28px);
}

[data-reveal="tilt"][data-revealed="false"] {
  transform: perspective(1000px) rotateX(12deg) translateZ(-60px);
}

[data-reveal="left"][data-revealed="false"] {
  transform: translateX(-48px) rotateY(6deg);
}

[data-reveal="right"][data-revealed="false"] {
  transform: translateX(48px) rotateY(-6deg);
}

[data-reveal="zoom"][data-revealed="false"] {
  transform: scale(1.08);
}

[data-reveal][data-revealed="true"] {
  opacity: 1;
  transform: none;
}

/* ---------- Reduced motion ----------
   Force the settled state and kill every transition. ParallaxLayer and
   CountUp check the same query in JS and skip their listeners entirely. */

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: none !important;
  }

  [data-reveal][data-revealed="false"] {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Create `src/components/motion/Reveal.tsx`**

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

export type RevealVariant = "fade-up" | "tilt" | "left" | "right" | "zoom";

export type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  /** Stagger offset in ms. Card grids pass delay={i * 90}. */
  delay?: number;
  className?: string;
};

/** useLayoutEffect warns when React renders on the server; useEffect is the
 *  server-safe stand-in. On the client we need the layout variant — see below. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Hide before the browser paints. The SSR markup is visible (no
  // data-revealed attribute), so useEffect here would paint the content
  // visible for one frame and then snap it hidden — a flash. useLayoutEffect
  // runs synchronously pre-paint, so the hidden state lands in the same frame.
  // These are not interchangeable.
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    ref.current?.setAttribute("data-revealed", "false");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.setAttribute("data-revealed", "true");
          observer.unobserve(el); // one-way: scrolling back up must not replay
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify the build**

```powershell
npm run build
```

Expected: exit 0. `Reveal` is not imported anywhere yet, so this only proves it typechecks and lints.

- [ ] **Step 5: Commit**

```powershell
git add src/app/globals.css src/components/motion/Reveal.tsx
git commit -m "feat(home): add scroll-reveal CSS and Reveal component"
```

---

### Task 2: `ParallaxLayer` and `CountUp`

**Files:**
- Create: `src/components/motion/ParallaxLayer.tsx`
- Create: `src/components/motion/CountUp.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export default function ParallaxLayer(props: ParallaxLayerProps)` where `ParallaxLayerProps = { speed: number; children: ReactNode; className?: string }`. `speed` is the fraction of normal page speed: `0` pins the layer, `1` scrolls it normally. Used by `HeroSection` (Task 5) and `FinalCtaBand` (Task 8).
  - `export default function CountUp(props: CountUpProps)` where `CountUpProps = { to: number; suffix?: string; durationMs?: number }`. Used by `StatsBand` (Task 5).

- [ ] **Step 1: Create `src/components/motion/ParallaxLayer.tsx`**

One module-level scroll listener and one rAF per frame are shared by every layer. Writing `transform` straight to the node keeps React out of the scroll path — per-frame `setState` would re-render the tree 60×/second and visibly jank.

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export type ParallaxLayerProps = {
  /** Fraction of normal page speed: 0 pins the layer, 1 scrolls it normally.
   *  Offset applied is scrollY * (1 - speed). Layers need enough overflow to
   *  stay covered at max offset — see the plan's speed table. */
  speed: number;
  children: ReactNode;
  className?: string;
};

type Layer = { el: HTMLElement; speed: number };

const layers = new Set<Layer>();
let listening = false;
let ticking = false;

function paint() {
  ticking = false;
  const y = window.scrollY;
  for (const { el, speed } of layers) {
    el.style.transform = `translate3d(0, ${(y * (1 - speed)).toFixed(2)}px, 0)`;
  }
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(paint);
}

function subscribe(layer: Layer) {
  layers.add(layer);
  if (!listening) {
    window.addEventListener("scroll", onScroll, { passive: true });
    listening = true;
  }
  paint(); // position correctly on a deep-linked / restored scroll position
}

function unsubscribe(layer: Layer) {
  layers.delete(layer);
  if (layers.size === 0 && listening) {
    window.removeEventListener("scroll", onScroll);
    listening = false;
  }
}

export default function ParallaxLayer({
  speed,
  children,
  className = "",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer: Layer = { el, speed };
    subscribe(layer);
    return () => unsubscribe(layer);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/motion/CountUp.tsx`**

`useState(to)` — not `useState(0)` — is deliberate: the server renders the real number, hydration matches, and a no-JS visitor sees the true count instead of a permanent `0`. The animation only starts after hydration.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export type CountUpProps = {
  to: number;
  suffix?: string;
  durationMs?: number;
};

export default function CountUp({
  to,
  suffix = "",
  durationMs = 1200,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Render the final value on the server and before hydration — never 0.
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(el);

          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setValue(Math.round(to * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, durationMs]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 3: Verify the build**

```powershell
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```powershell
git add src/components/motion/ParallaxLayer.tsx src/components/motion/CountUp.tsx
git commit -m "feat(home): add ParallaxLayer and CountUp motion components"
```

---

### Task 3: Source and commit the photography

**Files:**
- Create: `public/images/home/hero.jpg`, `client-review.jpg`, `pricing.jpg`, `freelancer.jpg`, `learn.jpg`, `cta.jpg`
- Create: `public/images/home/CREDITS.md`

**Interfaces:**
- Consumes: nothing.
- Produces: six files at `/images/home/<name>.jpg`, referenced by exact path in Tasks 5–8.

**Why this task has no hardcoded URLs.** Pexels photo IDs cannot be verified from memory, and a plan that hardcodes six invented IDs produces six 404s. So this task is a *procedure with acceptance criteria*: you find the photos, you prove each URL returns 200 before committing, and you record what you actually used. Candidate IDs below are starting points, **not** trusted values — verify every one.

- [ ] **Step 1: Create the directory**

```powershell
New-Item -ItemType Directory -Force public\images\home
```

- [ ] **Step 2: Pick six photos on Pexels**

Open `https://www.pexels.com` and search for each subject below. **Pexels only** — its licence is free for commercial use with no attribution required and no signup. Do not use Unsplash, Getty, Shutterstock, or Google Images.

| Target file | Search terms | Art direction |
|---|---|---|
| `hero.jpg` | `business team collaborating office` | Diverse professionals mid-collaboration. Landscape, room on one side for a headline, not a stiff posed boardroom. |
| `client-review.jpg` | `person reviewing work laptop office` | One person focused on a screen, reviewing something. Warm light. |
| `pricing.jpg` | `team planning whiteboard strategy` | Planning/decision moment. Suggests deliberation over a number. |
| `freelancer.jpg` | `freelancer working desk laptop home office` | Single person at a tidy workstation, absorbed in the work. |
| `learn.jpg` | `person studying online course laptop` | Someone learning — notes, screen, focus. |
| `cta.jpg` | `modern office team wide` | Wide, warm, human. Text will sit over the left third. |

Unverified candidate IDs to try first (from the widely-used `fauxels` business set): `3184291`, `3184418`, `3184465`, `3184338`, `3182773`, `4491461`. **Check each renders the right subject before using it** — an ID that 200s with the wrong photo is worse than a 404.

Prefer a **landscape** original ≥ 1920px wide for each.

- [ ] **Step 3: Verify each URL returns 200 before downloading**

For each chosen photo ID, the CDN URL follows this shape. The `w=1920` query does the resizing server-side, so no local image tooling (ImageMagick/sharp) is needed:

```bash
https://images.pexels.com/photos/<ID>/pexels-photo-<ID>.jpeg?auto=compress&cs=tinysrgb&w=1920
```

Check all six at once (Bash tool):

```bash
for id in <ID1> <ID2> <ID3> <ID4> <ID5> <ID6>; do
  code=$(curl.exe -s -o /dev/null -w "%{http_code}" -L \
    "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&w=1920" \
    --max-time 20)
  echo "$id -> $code"
done
```

Expected: every line ends in `-> 200`. Any other status (404, 403, 000) means that ID is wrong or blocked — go back to Step 2 and pick another. **Do not proceed with a non-200.**

- [ ] **Step 4: Download the six photos**

```bash
cd /c/Users/lmahi/Goodturn
base="https://images.pexels.com/photos"
q="auto=compress&cs=tinysrgb&w=1920"
curl.exe -L -o public/images/home/hero.jpg          "$base/<HERO_ID>/pexels-photo-<HERO_ID>.jpeg?$q"
curl.exe -L -o public/images/home/client-review.jpg "$base/<REVIEW_ID>/pexels-photo-<REVIEW_ID>.jpeg?$q"
curl.exe -L -o public/images/home/pricing.jpg       "$base/<PRICING_ID>/pexels-photo-<PRICING_ID>.jpeg?$q"
curl.exe -L -o public/images/home/freelancer.jpg    "$base/<FREELANCER_ID>/pexels-photo-<FREELANCER_ID>.jpeg?$q"
curl.exe -L -o public/images/home/learn.jpg         "$base/<LEARN_ID>/pexels-photo-<LEARN_ID>.jpeg?$q"
curl.exe -L -o public/images/home/cta.jpg           "$base/<CTA_ID>/pexels-photo-<CTA_ID>.jpeg?$q"
```

- [ ] **Step 5: Verify the files are real images within budget**

```powershell
Get-ChildItem public\images\home\*.jpg | Select-Object Name, @{n='KB';e={[int]($_.Length/1KB)}}
```

Expected: six rows. Each `KB` between roughly 60 and 400 — the spec's budget is ≤ 300 KB each, hero may reach ~400 KB. A file under ~5 KB is an error page saved as `.jpg`, not a photo; re-download it.

Then confirm each is actually a JPEG and not HTML:

```bash
file public/images/home/*.jpg
```

Expected: every line says `JPEG image data`. If any says `HTML document`, that download failed — fix before continuing.

**Look at each image with the Read tool** and confirm it matches its Step 2 art direction. A photo that loads but shows the wrong subject fails this task.

- [ ] **Step 6: Write `public/images/home/CREDITS.md`**

Replace every `<...>` with the real value you used. Attribution is not required by the Pexels licence; this file exists so the provenance of each asset is auditable.

```markdown
# Homepage photography

All photos from [Pexels](https://www.pexels.com), used under the
[Pexels licence](https://www.pexels.com/license/): free for commercial use,
no attribution required, modification allowed. Downloaded and committed to
this repo rather than hotlinked, so the site has no runtime CDN dependency.

Each was fetched at `?auto=compress&cs=tinysrgb&w=1920` (server-side resize).

| File | Photographer | Source |
|---|---|---|
| `hero.jpg` | <NAME> | https://www.pexels.com/photo/<HERO_ID>/ |
| `client-review.jpg` | <NAME> | https://www.pexels.com/photo/<REVIEW_ID>/ |
| `pricing.jpg` | <NAME> | https://www.pexels.com/photo/<PRICING_ID>/ |
| `freelancer.jpg` | <NAME> | https://www.pexels.com/photo/<LEARN_ID>/ |
| `learn.jpg` | <NAME> | https://www.pexels.com/photo/<LEARN_ID>/ |
| `cta.jpg` | <NAME> | https://www.pexels.com/photo/<CTA_ID>/ |
```

- [ ] **Step 7: Commit**

```powershell
git add public/images/home
git status --short
git commit -m "feat(home): add Pexels photography for homepage redesign"
```

Expected: `git status --short` shows exactly the six `.jpg` files and `CREDITS.md` staged — nothing else.

---

### Task 4: Reusable section primitives

**Files:**
- Create: `src/components/home/HeroSection.tsx` (shell only — filled in Task 5)

Skip. Folded into Task 5; no separate deliverable justifies a review gate.

---

### Task 5: Hero and stats band, wired into the page

**Files:**
- Create: `src/components/home/HeroSection.tsx`
- Create: `src/components/home/StatsBand.tsx`
- Modify: `src/app/page.tsx` (replace `MountainHero`; keep the other three sections working)

**Interfaces:**
- Consumes: `Reveal` (Task 1), `ParallaxLayer`, `CountUp` (Task 2), `/images/home/hero.jpg` (Task 3).
- Produces:
  - `export default function HeroSection()` — no props.
  - `export default function StatsBand(props: StatsBandProps)` where `StatsBandProps = { openJobs: number; categories: number; members: number }`.
  - `src/app/page.tsx` exports `const revalidate = 3600`.

- [ ] **Step 1: Create `src/components/home/HeroSection.tsx`**

The mountain SVG paths are carried over verbatim from the current `MountainHero` — same silhouette, now on its own parallax layer.

```tsx
import Image from "next/image";
import Link from "next/link";
import ParallaxLayer from "@/components/motion/ParallaxLayer";
import Reveal from "@/components/motion/Reveal";

export default function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden bg-ink text-white">
      {/* Photo + scrim: h-[150%] gives 50vh of overflow, which is exactly the
          max offset at speed 0.5, so the frame stays covered as it scrolls. */}
      <ParallaxLayer speed={0.5} className="absolute inset-x-0 top-0 h-[150%]">
        <Image
          src="/images/home/hero.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-brand/50" />
      </ParallaxLayer>

      <ParallaxLayer
        speed={0.7}
        className="absolute inset-x-0 bottom-0 h-[130%] pointer-events-none"
      >
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full opacity-40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path fill="#0b1526" d="M0 320 320 96l224 160L768 64l288 192 176-128 208 160v32H0Z" />
          <path fill="#10203a" d="m0 320 256-128 192 96 256-192 320 224 224-160 192 160H0Z" />
        </svg>
      </ParallaxLayer>

      <ParallaxLayer
        speed={0.85}
        className="relative flex h-full items-center"
      >
        <div className="mx-auto w-full max-w-6xl px-4">
          <Reveal variant="fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Goodturn Jobs
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={90}>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              Hire vetted freelance talent for work that matters
            </h1>
          </Reveal>

          <Reveal variant="fade-up" delay={180}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-200">
              Post a job, set your own price, and let our matching system put it in
              front of freelancers screened on skills and certifications. Goodturn
              Jobs is one of three connected businesses, alongside Goodturn Connect
              for working together and Goodturn Learn for building the skills that
              get the work done.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={270}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/post-a-job"
                className="rounded-lg bg-brand px-8 py-4 text-lg font-semibold tracking-wide shadow-lg shadow-ink/40 transition hover:bg-accent"
              >
                Post a Job
              </Link>
              <Link
                href="/find-work"
                className="rounded-lg border border-white/40 px-8 py-4 text-lg font-medium tracking-wide transition hover:border-white hover:bg-white/10"
              >
                Find Work
              </Link>
            </div>
          </Reveal>
        </div>
      </ParallaxLayer>

      <div
        className="absolute inset-x-0 bottom-8 flex justify-center"
        aria-hidden
      >
        <svg
          className="h-6 w-6 animate-bounce text-white/60"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/StatsBand.tsx`**

Counts render plainly, including `0` on a fresh database — no `—`, no fabricated floor.

```tsx
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";

export type StatsBandProps = {
  openJobs: number;
  categories: number;
  members: number;
};

const VALUE_TILES = [
  {
    title: "You set the price",
    body: "Name your budget. Category minimums keep offers fair, nothing more.",
  },
  {
    title: "AI-matched applicants",
    body: "Applicants ranked against your brief by skills and certifications.",
  },
  {
    title: "Global payments",
    body: "Visa, Mastercard, PayPal, Mpesa and crypto wallets, on secure checkout.",
  },
];

export default function StatsBand({
  openJobs,
  categories,
  members,
}: StatsBandProps) {
  const stats = [
    { label: "Open jobs", value: openJobs },
    { label: "Skill categories", value: categories },
    { label: "Members", value: members },
  ];

  return (
    <section className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} variant="fade-up" delay={i * 90}>
              <div className="text-center">
                <p className="text-5xl font-extrabold text-accent sm:text-6xl">
                  <CountUp to={stat.value} />
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.15em] text-neutral-400">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {VALUE_TILES.map((tile, i) => (
            <Reveal key={tile.title} variant="tilt" delay={i * 90}>
              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-bold text-white">{tile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                  {tile.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire both into `src/app/page.tsx`**

Delete the `MountainHero` function entirely and replace its usage. Leave `JobsSection`, `LearnSection`, and `ConnectSection` in place for now — later tasks replace them one at a time, so the page keeps working throughout.

At the top of the file, replace the existing imports with:

```tsx
import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import { prisma } from "@/lib/db";
import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";

export const revalidate = 3600;
```

Then replace the `HomePage` export at the bottom:

```tsx
export default async function HomePage() {
  const [openJobs, categories, members] = await Promise.all([
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.category.count(),
    prisma.user.count(),
  ]);

  return (
    <>
      <HeroSection />
      <StatsBand openJobs={openJobs} categories={categories} members={members} />
      <JobsSection />
      <LearnSection />
      <ConnectSection />
    </>
  );
}
```

- [ ] **Step 4: Verify tests and build**

```powershell
npm test
npm run build
```

Expected: `Tests  37 passed (37)`. Build exits 0. In the route table, `/` must still be listed as prerendered — look for the `ISR` / `Revalidate: 1h` annotation on the `/` row, **not** `ƒ (Dynamic)`. If `/` went dynamic, `export const revalidate = 3600` is missing or misplaced.

- [ ] **Step 5: Browser check**

```powershell
npm run dev
```

Open `http://localhost:3000`. Confirm all of:
1. The hero fills the viewport and the photo is visible behind the gradient.
2. Scrolling slowly moves the photo, mountains, and headline at **visibly different rates**.
3. No gap or bare background appears at the top of the photo as the hero scrolls away.
4. The stats show the seeded numbers (non-zero — the DB is seeded with 8 jobs and 3 users) and count up when scrolled into view.
5. Post a Job → `/post-a-job`; Find Work → `/find-work`.

Stop the dev server when done. If any check fails, fix it before committing.

- [ ] **Step 6: Commit**

```powershell
git add src/components/home/HeroSection.tsx src/components/home/StatsBand.tsx src/app/page.tsx
git commit -m "feat(home): add parallax hero and live stats band"
```

---

### Task 6: For Clients section and How it Works strip

**Files:**
- Create: `src/components/home/ForClientsSection.tsx`
- Create: `src/components/home/HowItWorksStrip.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 1), `/images/home/client-review.jpg` and `/images/home/pricing.jpg` (Task 3).
- Produces: `export default function ForClientsSection()` and `export default function HowItWorksStrip()` — neither takes props.

- [ ] **Step 1: Create `src/components/home/ForClientsSection.tsx`**

Every claim here is carried over from the approved 2026-07-14 spec — in-app specialists, learn-with-us readiness, AI screening on education and skills, certificates boosting rank, and the per-category minimum priced on hours and complexity. Expanded in wording, unchanged in substance.

```tsx
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function ForClientsSection() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal variant="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            For clients
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            The work gets done properly, or it doesn&apos;t get marked done
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Goodturn Jobs is built around one idea: you should be able to describe
            what you need, name a fair price, and get applicants who are actually
            equipped to deliver it.
          </p>
        </Reveal>

        <div className="mt-20 grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="left">
            <h3 className="text-2xl font-bold text-brand">
              A large, high-quality freelancer skillset
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-700">
              Our freelancers cover a wide variety of skillsets, enough to make
              almost any work that can be done online possible. We also provide
              in-app specialists who support freelancers as they work, which lifts
              the quality of what you get back. Our learn-with-us programme keeps
              freelancers ready for whatever your job description asks of them.
            </p>
          </Reveal>

          <Reveal variant="zoom">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl shadow-ink/20">
              <Image
                src="/images/home/client-review.jpg"
                alt="A client reviewing freelance work on a laptop"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="zoom" className="md:order-last">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl shadow-ink/20">
              <Image
                src="/images/home/pricing.jpg"
                alt="A team planning a project together"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal variant="right">
            <h3 className="text-2xl font-bold text-brand">
              Matched by AI, ranked by certification
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-700">
              Our platform screens freelancers on their educational background and
              skill set, then matches them against your job posting through our
              artificial intelligence system so you get the best match possible.
              Freelancers are encouraged to keep learning and earning new
              certificates, and every certificate they earn boosts their ranking
              against jobs like yours.
            </p>
          </Reveal>
        </div>

        <Reveal variant="tilt" className="mt-24">
          <div className="rounded-2xl bg-ink p-10 text-white shadow-2xl shadow-ink/30 sm:p-14">
            <h3 className="text-3xl font-bold">You set the price</h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-neutral-300">
              You are responsible for setting your own price for the job. For each
              category there is a minimum, worked out from the number of hours you
              estimate and the complexity of the job. That minimum is not a fee we
              take. It exists so the posting is worth a good freelancer&apos;s time,
              which is the difference between a job that attracts applicants and one
              that sits untouched.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/post-a-job"
                className="rounded-lg bg-brand px-8 py-4 font-semibold tracking-wide transition hover:bg-accent"
              >
                Post a Job
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-white/40 px-8 py-4 font-medium tracking-wide transition hover:border-white hover:bg-white/10"
              >
                How it Works
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/HowItWorksStrip.tsx`**

Steps mirror `/how-it-works` so the two pages never disagree.

```tsx
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Post a job and enter details",
    body: "Describe the work, pick a category, estimate the hours, set your price. We show you the category minimum as you type.",
  },
  {
    n: "02",
    title: "Receive applications",
    body: "Applicants arrive ranked by match. Filter them, wishlist the promising ones, and deny the rest without a conversation.",
  },
  {
    n: "03",
    title: "Accept, and work begins",
    body: "Accept a freelancer and the job moves to in progress. You are both logged in to Goodturn Connect to work together.",
  },
];

export default function HowItWorksStrip() {
  return (
    <section className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal variant="fade-up">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Three steps from posting to progress
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} variant="tilt" delay={i * 120}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                <p className="text-5xl font-extrabold text-accent/30">{step.n}</p>
                <h3 className="mt-4 text-xl font-bold text-brand">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-600">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fade-up" className="mt-12">
          <Link
            href="/how-it-works"
            className="font-semibold text-brand underline-offset-4 hover:text-accent hover:underline"
          >
            See the full workflow, including payment and completion →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `src/app/page.tsx`**

Add to the imports:

```tsx
import ForClientsSection from "@/components/home/ForClientsSection";
import HowItWorksStrip from "@/components/home/HowItWorksStrip";
```

In `HomePage`, insert both after `StatsBand`, leaving `JobsSection` in place (Task 7 removes it):

```tsx
      <StatsBand openJobs={openJobs} categories={categories} members={members} />
      <ForClientsSection />
      <HowItWorksStrip />
      <JobsSection />
```

- [ ] **Step 4: Verify**

```powershell
npm test
npm run build
```

Expected: `Tests  37 passed (37)`; build exits 0. A raw apostrophe in the new JSX will fail the build here — the two in this task are already escaped as `&apos;`.

- [ ] **Step 5: Browser check**

```powershell
npm run dev
```

At `http://localhost:3000`: both new sections reveal as they enter view, the two photos load, the alternating left/right image order holds on desktop, and the "You set the price" card tilts in. Stop the server.

- [ ] **Step 6: Commit**

```powershell
git add src/components/home/ForClientsSection.tsx src/components/home/HowItWorksStrip.tsx src/app/page.tsx
git commit -m "feat(home): add for-clients section and how-it-works strip"
```

---

### Task 7: For Freelancers section, replacing the old JobsSection

**Files:**
- Create: `src/components/home/ForFreelancersSection.tsx`
- Modify: `src/app/page.tsx` (delete `JobsSection` entirely)

**Interfaces:**
- Consumes: `Reveal` (Task 1), `/images/home/freelancer.jpg` (Task 3).
- Produces: `export default function ForFreelancersSection()` — no props.

- [ ] **Step 1: Create `src/components/home/ForFreelancersSection.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function ForFreelancersSection() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="zoom">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-2xl shadow-ink/20">
              <Image
                src="/images/home/freelancer.jpg"
                alt="A freelancer working at their workstation"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div>
            <Reveal variant="right">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                For freelancers
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
                Work you&apos;re actually suited to, paid the way you want
              </h2>
            </Reveal>

            <Reveal variant="right" delay={90}>
              <div className="mt-10">
                <h3 className="text-xl font-bold text-brand">Find your best match</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  Search the board yourself, or hit Find Best Match and let us rank
                  every open job against the skills on your profile. The better your
                  profile, the better the ranking.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={180}>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-brand">A fast payment system</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  We accept Visa, Mastercard, PayPal, Mpesa and all crypto wallets,
                  so your mode of payment is available globally. Our secure checkout
                  system guarantees your money&apos;s safety.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={270}>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-brand">Grow into better work</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  Every certificate you earn through Goodturn Learn lifts your
                  ranking against the jobs you want. Learning is how you move up the
                  list, not just how you fill time between contracts.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={360}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/find-work"
                  className="rounded-lg bg-ink px-8 py-4 font-semibold tracking-wide text-white transition hover:bg-neutral-700"
                >
                  Find Work
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-lg bg-accent px-8 py-4 font-medium tracking-wide text-white transition hover:opacity-90"
                >
                  How it Works
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete `JobsSection` from `src/app/page.tsx`**

Remove the entire `function JobsSection() { ... }` declaration. Its client copy now lives in `ForClientsSection` and its freelancer copy in `ForFreelancersSection`.

Add the import:

```tsx
import ForFreelancersSection from "@/components/home/ForFreelancersSection";
```

Replace `<JobsSection />` in the returned tree with `<ForFreelancersSection />`:

```tsx
      <HowItWorksStrip />
      <ForFreelancersSection />
      <LearnSection />
```

- [ ] **Step 3: Verify**

```powershell
npm test
npm run build
```

Expected: `Tests  37 passed (37)`; build exits 0. If the build reports `'JobsSection' is defined but never used`, the function body was left behind — delete it.

- [ ] **Step 4: Commit**

```powershell
git add src/components/home/ForFreelancersSection.tsx src/app/page.tsx
git commit -m "feat(home): add for-freelancers section, retire old jobs section"
```

---

### Task 8: Learn, Connect, and the final CTA band

**Files:**
- Create: `src/components/home/LearnSection.tsx`
- Create: `src/components/home/ConnectSection.tsx`
- Create: `src/components/home/FinalCtaBand.tsx`
- Modify: `src/app/page.tsx` (delete the inline `LearnSection` and `ConnectSection`; final shape reached)

**Interfaces:**
- Consumes: `Reveal` (Task 1), `ParallaxLayer` (Task 2), `/images/home/learn.jpg` and `/images/home/cta.jpg` (Task 3), existing `ComingSoon` (`src/components/ComingSoon.tsx`, props `{ label, note, className? }`).
- Produces: three default-exported prop-less components. `src/app/page.tsx` reaches its final ~35-line form.

- [ ] **Step 1: Create `src/components/home/LearnSection.tsx`**

Copy is the existing Learn text, tightened. The claims — 100+ certificate categories via LinkedIn/Google/universities/own material, 20 teaching categories, you choose your rate, board plus Connect chat — are unchanged.

```tsx
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function LearnSection() {
  return (
    <section className="bg-brand py-24 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Reveal variant="left">
              <h2 className="text-4xl font-extrabold sm:text-5xl">Goodturn Learn</h2>
              <p className="mt-4 max-w-xl text-lg text-neutral-200">
                A world-class learning system built for every level of knowledge,
                from beginners to industry experts.
              </p>
            </Reveal>

            <Reveal variant="left" delay={120}>
              <div className="mt-10">
                <h3 className="text-xl font-semibold">Want to learn …</h3>
                <p className="mt-3 leading-relaxed text-neutral-200">
                  Browse over 100 categories of certificates offered through
                  LinkedIn, Google Certificates, universities and our own expert
                  material. Each certificate earned gets you closer to better paying
                  jobs.
                </p>
              </div>
            </Reveal>

            <Reveal variant="left" delay={210}>
              <div className="mt-8">
                <h3 className="text-xl font-semibold">Already an expert …</h3>
                <p className="mt-3 leading-relaxed text-neutral-200">
                  Get paid to teach freelancers on the topic of your expertise across
                  20 topic categories and hundreds of subcategories. You choose the
                  amount and rate you are paid, post your experience and designs to
                  your board, and chat with potential customers through Goodturn
                  Connect.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <Link
                href="/learn"
                className="mt-10 inline-block rounded-lg bg-ink px-8 py-4 font-semibold text-white transition hover:bg-neutral-700"
              >
                Go to Learn Page
              </Link>
            </Reveal>
          </div>

          <Reveal variant="zoom">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl shadow-ink/40">
              <Image
                src="/images/home/learn.jpg"
                alt="A person studying an online course"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/ConnectSection.tsx`**

The Account ID note and `ComingSoon` are preserved exactly as the spec requires.

```tsx
import ComingSoon from "@/components/ComingSoon";
import Reveal from "@/components/motion/Reveal";

export default function ConnectSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <Reveal variant="fade-up">
              <h2 className="text-4xl font-extrabold sm:text-5xl">Goodturn Connect</h2>
              <h3 className="mt-4 text-xl font-bold text-brand">
                Connect with users anywhere through video, call, chat and SMS
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-700">
                You are going to apply for jobs all over the world. You should still
                feel connected to your customers as though you were in the room with
                them. Goodturn Connect gives you team management and direct messaging
                so nothing gets lost between kickoff and completion.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <p className="mt-6 font-semibold leading-relaxed text-brand">
                Please note: you will be automatically logged in to Goodturn Connect
                when you post a job or are accepted for a job. Use your Account ID to
                sign up to the Goodturn Connect platform. Your ID can be found on the
                Accounts page.
              </p>
              <div className="mt-8">
                <ComingSoon
                  label="Go to Connect"
                  note="Goodturn Connect is coming soon — stay tuned!"
                />
              </div>
            </Reveal>
          </div>

          <Reveal variant="tilt">
            <div className="rounded-2xl bg-gradient-to-br from-brand via-[#2a3568] to-ink p-10 text-white shadow-2xl shadow-ink/20">
              <p className="text-lg font-semibold">
                Team management, direct messaging, file sharing and in-app APIs
              </p>
              <p className="mt-3 leading-relaxed text-neutral-300">
                The Goodturn Connect Workstation keeps you and your clients on the
                same page from kickoff to completion.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/home/FinalCtaBand.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import ParallaxLayer from "@/components/motion/ParallaxLayer";
import Reveal from "@/components/motion/Reveal";

export default function FinalCtaBand() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <ParallaxLayer speed={0.7} className="absolute inset-x-0 top-0 h-[130%]">
        <Image
          src="/images/home/cta.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-brand/50" />
      </ParallaxLayer>

      <div className="relative mx-auto max-w-6xl px-4 py-32">
        <Reveal variant="fade-up">
          <h2 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Post your first job today
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-200">
            Describe the work, set your price, and see who applies. It costs nothing
            to find out what the right freelancer would do with it.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/post-a-job"
              className="rounded-lg bg-brand px-8 py-4 text-lg font-semibold tracking-wide shadow-lg shadow-ink/40 transition hover:bg-accent"
            >
              Post a Job
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/40 px-8 py-4 text-lg font-medium tracking-wide transition hover:border-white hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Reduce `src/app/page.tsx` to its final form**

Delete the inline `LearnSection` and `ConnectSection` functions. The whole file becomes exactly:

```tsx
import { prisma } from "@/lib/db";
import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";
import ForClientsSection from "@/components/home/ForClientsSection";
import HowItWorksStrip from "@/components/home/HowItWorksStrip";
import ForFreelancersSection from "@/components/home/ForFreelancersSection";
import LearnSection from "@/components/home/LearnSection";
import ConnectSection from "@/components/home/ConnectSection";
import FinalCtaBand from "@/components/home/FinalCtaBand";

export const revalidate = 3600;

export default async function HomePage() {
  const [openJobs, categories, members] = await Promise.all([
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.category.count(),
    prisma.user.count(),
  ]);

  return (
    <>
      <HeroSection />
      <StatsBand openJobs={openJobs} categories={categories} members={members} />
      <ForClientsSection />
      <HowItWorksStrip />
      <ForFreelancersSection />
      <LearnSection />
      <ConnectSection />
      <FinalCtaBand />
    </>
  );
}
```

Note the `Link` and `ComingSoon` imports are gone — nothing in this file uses them any more.

- [ ] **Step 5: Verify**

```powershell
npm test
npm run build
```

Expected: `Tests  37 passed (37)`; build exits 0 with no unused-import or unused-variable errors.

- [ ] **Step 6: Commit**

```powershell
git add src/components/home/LearnSection.tsx src/components/home/ConnectSection.tsx src/components/home/FinalCtaBand.tsx src/app/page.tsx
git commit -m "feat(home): add learn, connect, and final CTA sections"
```

---

### Task 9: Full verification pass

**Files:**
- Modify: any of the above, only if a check below fails.

**Interfaces:**
- Consumes: the finished page.
- Produces: a verified branch ready for review.

This task is where the spec's five verification requirements get discharged. **Report actual observed output for each — never "should pass."** If a check fails, fix it, re-run, and say so in the report.

- [ ] **Step 1: Tests and build**

```powershell
npm test
npm run build
```

Record: the test count line, the build exit status, and the `/` row from the route table. Expected: 37 passed; exit 0; `/` prerendered with a 1h revalidate, not `ƒ (Dynamic)`.

- [ ] **Step 2: Desktop browser pass at 1440px**

```powershell
npm run dev
```

At `http://localhost:3000`, confirm and record each:
1. Total scroll is at least 2 full viewports — measure in the console: `document.body.scrollHeight / window.innerHeight`. Expected: **≥ 5**.
2. All eight segments reveal as they enter view; none is stuck invisible.
3. Hero parallax shows visible depth between photo, mountains, and headline, with no uncovered gap at any scroll position.
4. Stats count up once, and do not replay when scrolled away and back.
5. Every CTA routes correctly: `/post-a-job` (×3 — hero, clients card, final band), `/find-work` (×2), `/how-it-works` (×2), `/learn`, `/contact`.
6. Scrolling is smooth — no visible jank or stutter through the parallax segments.

- [ ] **Step 3: Mobile pass at 390px**

In devtools, set the viewport to 390×844 (iPhone 12/13/14). Confirm:
1. **No horizontal overflow.** Check in the console: `document.documentElement.scrollWidth <= window.innerWidth`. Expected: `true`.
2. Every two-column grid stacks to one column.
3. The hero headline does not overflow or clip; CTAs stay tappable.
4. Photos still fill their frames without distortion.

- [ ] **Step 4: Degradation pass — this is the one most likely to fail**

**JS disabled:** in Chrome devtools, `Ctrl+Shift+P` → "Disable JavaScript" → reload.
- Expected: the **entire page is readable**. Every section visible, all text present, no blank gaps, real stat numbers (not `0`).
- If any section is invisible, a hidden state has leaked into the SSR markup — that is a bug in `Reveal`, not in this check.

**Reduced motion:** devtools `Ctrl+Shift+P` → "Emulate CSS prefers-reduced-motion: reduce" → reload with JS re-enabled.
- Expected: all content visible with no reveal transitions, no parallax movement on scroll, and stats showing final numbers without counting.

Stop the dev server.

- [ ] **Step 5: Confirm stats are live, not hardcoded**

With the dev server running, `grep` the built page for a hardcoded number, then verify against the DB:

```bash
grep -rE '\b(8|3)\b' src/components/home/StatsBand.tsx || echo "no hardcoded counts"
```

Expected: `no hardcoded counts` — every number arrives via props.

Confirm the rendered figures match the seeded database (8 jobs, 3 users, and the seeded category count). If the numbers on the page differ from the database, the query is wrong.

- [ ] **Step 6: Confirm no dependency drift and a clean tree**

```powershell
git diff master --stat -- package.json package-lock.json
git status --short
```

Expected: the first prints **nothing** (zero dependency changes — a non-empty diff means the zero-dependency constraint was broken and must be reverted). The second prints nothing, or only untracked files on the do-not-commit list.

- [ ] **Step 7: Review the whole branch diff**

```powershell
git diff master..HEAD --stat
git log --oneline master..HEAD
```

Expected: 6 commits; changes confined to `src/app/page.tsx`, `src/app/globals.css`, `src/components/home/`, `src/components/motion/`, and `public/images/home/`. **Any file outside that list is out of scope** — investigate and revert it.

- [ ] **Step 8: Commit any fixes**

Only if Steps 1–7 required changes:

```powershell
git add <the specific files you changed>
git commit -m "fix(home): <what you fixed>"
```

---

## Handoff

The branch is local. There is no GitHub remote and `gh` is not installed, so no PR is opened — by user decision, GitHub is deferred. The six commits are PR-shaped, so the branch can be pushed and opened as a pull request later without rewriting:

```powershell
# later, once a private repo exists:
git remote add origin <url>
git push -u origin homepage-redesign
# then open the compare URL in a browser; Git Credential Manager handles auth
```

Do not merge to `master` without the user's explicit go-ahead.
