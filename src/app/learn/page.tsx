import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Goodturn Learn</p>
      <h1 className="mt-3 text-4xl font-extrabold text-brand dark:text-accent sm:text-5xl">
        The skills the work actually needs
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
        Learn is the training arm of a work platform. We don&apos;t sell courses — we build proven
        capability, trained to the exact standard our clients need, with real paid work at the end of it.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-brand dark:text-accent">For businesses</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            We train a team to your exact spec so they are productive on day one — and we measure the
            result. When a quality issue appears in delivery, it becomes a targeted training module, so
            your defect rate falls over time.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Employ staff in Kenya? You already pay the NITA training levy every month. We can help you put
            that money toward accredited training, so your net cost can be close to nothing.
          </p>
          <Link href="/contact" className="mt-4 inline-block font-semibold text-brand underline-offset-4 hover:underline dark:text-accent">
            Talk to us about a trained team →
          </Link>
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-brand dark:text-accent">For workers</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Free, mobile-first training that leads to real paid work with us — not a certificate that goes
            nowhere. Prove you can do a specific job, and get assigned to a delivery team that pays at or
            above our published fair-pay floor.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Build a verified track record on real deliveries and move into higher-value work over time.
          </p>
          <Link href="/signup" className="mt-4 inline-block font-semibold text-brand underline-offset-4 hover:underline dark:text-accent">
            Join our delivery teams →
          </Link>
        </section>
      </div>

      <p className="mt-10 text-sm text-neutral-500 dark:text-neutral-400">
        Course library, assessments and certification are rolling out. In the meantime, the fastest path
        to work is to <Link href="/signup" className="font-medium text-brand underline dark:text-accent">create a worker profile</Link>.
      </p>
    </div>
  );
}
