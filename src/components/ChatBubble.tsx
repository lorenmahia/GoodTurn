"use client";

import Link from "next/link";
import { useState } from "react";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-charcoal">
          <h3 className="font-semibold text-brand dark:text-accent">Goodturn Connect</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Your job conversations live here. A thread opens when you accept an applicant or are accepted for a job.
          </p>
          <Link
            href="/connect"
            className="mt-3 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-accent"
          >
            Open Connect
          </Link>
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
