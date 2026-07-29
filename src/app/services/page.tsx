import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Services — Goodturn",
  description:
    "Fixed-scope, fixed-price managed-delivery services from Kenya, with clear turnarounds, quality guarantees, verified fair pay and compliance handled.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Managed delivery</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold text-brand dark:text-accent sm:text-5xl">
        Fixed scope, fixed price, guaranteed delivery
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
        Start with a productised service — you know exactly what you get, by when, and to what standard.
        Verified fair pay and compliance are handled, on one clean invoice. Need something else? Book a
        call and we&apos;ll scope it with you.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-ink p-10 text-white">
        <h2 className="text-2xl font-bold">Not sure which fits?</h2>
        <p className="mt-2 max-w-2xl text-neutral-300">
          Tell us the outcome you need and we&apos;ll recommend a scope, price and turnaround — with a
          delivery guarantee we contractually stand behind.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-lg bg-brand px-8 py-4 font-semibold transition hover:bg-accent"
        >
          Book a call
        </Link>
      </div>
    </div>
  );
}
