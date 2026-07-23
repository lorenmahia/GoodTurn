import Link from "next/link";
import Logo from "./Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Read and Learn",
    links: [
      { label: "Our User Guide", href: "/how-it-works" },
      { label: "Reference Library", href: "/learn" },
      { label: "News", href: "/learn" },
    ],
  },
  {
    heading: "Connect and Ask",
    links: [
      { label: "Goodturn Forum", href: "/learn" },
      { label: "Trusted Agencies", href: "/learn" },
      { label: "Trust & Safety", href: "/safety" },
      { label: "FAQ's", href: "/how-it-works" },
    ],
  },
  {
    heading: "Bookmark and Follow",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Blog", href: "/learn" },
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
          <Link href="/contact" className="hover:text-white">Reset password</Link>
        </div>
      </div>
    </footer>
  );
}
