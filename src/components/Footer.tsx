import Link from "next/link";
import Logo from "./Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "What we do",
    links: [
      { label: "Our Services", href: "/services" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Goodturn Learn", href: "/learn" },
    ],
  },
  {
    heading: "Trust & Fair Work",
    links: [
      { label: "Fair Work & Transparency", href: "/safety" },
      { label: "Data protection", href: "/safety" },
      { label: "Talk to us", href: "/contact" },
    ],
  },
  {
    heading: "Work with us",
    links: [
      { label: "Join our delivery teams", href: "/signup" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Twitter", href: "https://twitter.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center gap-4">
          <div className="rounded bg-black p-2">
            <Logo className="h-10 w-10" />
          </div>
          <span className="text-xl font-semibold">Goodturn Company</span>
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-semibold">{col.heading}</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-800 bg-[#0d0d1a]">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 px-4 py-5 text-sm text-neutral-300">
          <span>Copyright Goodturn {new Date().getFullYear()}</span>
          <Link href="/" className="hover:text-white">About the Company</Link>
          <Link href="/how-it-works" className="hover:text-white">Terms and conditions</Link>
          <Link href="/contact" className="hover:text-white">Contact us</Link>
        </div>
      </div>
    </footer>
  );
}
