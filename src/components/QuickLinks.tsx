import Link from "next/link";

const LINKS = [
  { label: "My Jobs", href: "/account#my-applications" },
  { label: "My Profile", href: "/profile" },
  { label: "Jobs I Posted", href: "/account#jobs-posted" },
  { label: "Withdraw Funds", href: "/account" },
];

export default function QuickLinks() {
  return (
    <aside className="rounded-2xl border border-neutral-200 p-5">
      <h2 className="text-center font-semibold">Quick Links</h2>
      <ul className="mt-4 space-y-3">
        {LINKS.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="block rounded-lg bg-neutral-50 px-4 py-3 text-center font-medium tracking-wide text-brand shadow-sm hover:bg-neutral-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
