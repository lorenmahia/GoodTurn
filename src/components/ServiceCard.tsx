import Link from "next/link";
import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">{service.category}</p>
      <h3 className="mt-2 text-xl font-bold text-brand dark:text-accent">{service.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{service.summary}</p>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500 dark:text-neutral-400">Price</dt>
          <dd className="text-right font-semibold">{service.price}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500 dark:text-neutral-400">Turnaround</dt>
          <dd className="text-right">{service.turnaround}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500 dark:text-neutral-400">Guarantee</dt>
          <dd className="text-right">{service.guarantee}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        {service.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="flex-1" />
      <Link
        href="/contact"
        className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-center font-semibold text-white transition hover:bg-accent"
      >
        Book this service
      </Link>
    </div>
  );
}
