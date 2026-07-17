"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

export type RevealVariant = "fade-up" | "tilt" | "left" | "right" | "zoom";

export type RevealProps = {
  children: ReactNode;
  /** Stagger offset in ms. Card grids pass delay={i * 90}. */
  delay?: number;
  variant?: RevealVariant;
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
