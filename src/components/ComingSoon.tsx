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
