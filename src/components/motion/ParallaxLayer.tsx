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

type Layer = {
  el: HTMLElement;
  speed: number;
  anchor: number;
  sectionTop: number;
  overflowAbove: number;
};

const layers = new Set<Layer>();
let listening = false;
let ticking = false;

function paint() {
  ticking = false;
  const y = window.scrollY;
  for (const { el, speed, anchor, sectionTop, overflowAbove } of layers) {
    // Progress is measured from when the layer's section enters the viewport,
    // not from absolute scrollY — a layer deep in the page must sit at its CSS
    // position until its section approaches, or it gets translated thousands
    // of pixels away and (being lazy-loaded) never even loads.
    const raw = Math.max(0, y - anchor) * (1 - speed);
    // A layer may drift down only as far as its overflow above the frame plus
    // the part of its section already scrolled off-screen (uncoverable area
    // there is invisible). Without the cap, any content below the section —
    // like the footer — extends the scroll range past what the overflow covers
    // and a bare sliver appears at the section's top edge.
    const allowance = overflowAbove + Math.max(0, y - sectionTop);
    const offset = Math.min(raw, allowance);
    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
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

    // Anchor on the containing section (the nearest positioned ancestor), so
    // every layer of a section shares one origin. max(0, …) keeps sections in
    // the first viewport — the hero — anchored at the very top of the page.
    const section = (el.offsetParent as HTMLElement | null) ?? el;
    const sectionRect = section.getBoundingClientRect();
    const layerRect = el.getBoundingClientRect();
    const sectionTop = sectionRect.top + window.scrollY;
    const anchor = Math.max(0, sectionTop - window.innerHeight);
    const overflowAbove = Math.max(0, sectionRect.top - layerRect.top);

    const layer: Layer = { el, speed, anchor, sectionTop, overflowAbove };
    subscribe(layer);
    return () => unsubscribe(layer);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
