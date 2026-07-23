"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

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
      <Link href="/account" className="text-sm text-neutral-300 hover:text-white dark:text-neutral-400 dark:hover:text-white">Hi, {userName}</Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Log out
      </button>
    </>
  ) : (
    <Link href="/login" className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90">
      Sign up/Log in
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-charcoal text-white shadow dark:border-b dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-wide">Goodturn</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-neutral-200 transition hover:text-accent dark:text-neutral-300 dark:hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex"><ThemeToggle />{authControls}</div>
        <button aria-label="Menu" onClick={() => setOpen(!open)} className="p-1 md:hidden">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {open && (
        <nav className="space-y-1 border-t border-neutral-700 px-4 pb-4 pt-2 md:hidden dark:border-white/10">
          <div className="px-2 py-2"><ThemeToggle /></div>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded px-2 py-2 transition hover:bg-neutral-700 dark:hover:bg-white/10">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-2 pt-2">{authControls}</div>
        </nav>
      )}
    </header>
  );
}
