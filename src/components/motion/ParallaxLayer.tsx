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
