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
