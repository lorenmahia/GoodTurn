import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function ForClientsSection() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal variant="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            For businesses
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            You describe the outcome. We deliver it — and stand behind it.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Goodturn is a managed delivery service, not a marketplace of CVs. You get
            a finished result, one accountable delivery lead, and a named team you can
            see — without hiring, onboarding, or line-managing anyone.
          </p>
        </Reveal>

        <div className="mt-20 grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="left">
            <h3 className="text-2xl font-bold text-brand">
              A vetted team, run for you
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-700">
              We assemble and manage a team matched to your work — data operations,
              catalogue and content, support, annotation, East-African language work
              and more. A delivery lead owns the outcome, batches your questions, and
              is your single point of contact. Our people are trained to your spec
              through Goodturn Learn, so they are productive from day one.
            </p>
          </Reveal>

          <Reveal variant="zoom">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl shadow-ink/20">
              <Image
                src="/images/home/client-review.jpg"
                alt="A client reviewing freelance work on a laptop"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="zoom" className="md:order-last">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl shadow-ink/20">
              <Image
                src="/images/home/pricing.jpg"
                alt="A team planning a project together"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal variant="right">
            <h3 className="text-2xl font-bold text-brand">
              Quality you can audit
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-700">
              Every submission is reviewed against your brief before it reaches you,
              with a reason-coded quality record you can see. You get a live view of
              who did what, a daily digest, and a monthly review where the numbers —
              defect rate, turnaround, throughput — are on the table. Nothing is
              marked done until it is done properly.
            </p>
          </Reveal>
        </div>

        <Reveal variant="tilt" className="mt-24">
          <div className="rounded-2xl bg-ink p-10 text-white shadow-2xl shadow-ink/30 sm:p-14">
            <h3 className="text-3xl font-bold">One invoice, zero exposure</h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-neutral-300">
              Start with a fixed-scope, fixed-price service and know exactly what you
              are getting, by when, at what quality. We handle the delivery, the
              compliance — eTIMS, withholding tax, one clean invoice — and the fair,
              verified pay to the people doing the work. If we miss the standard we
              agreed, that is on us, not you.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="rounded-lg bg-brand px-8 py-4 font-semibold tracking-wide transition hover:bg-accent"
              >
                See our services
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-white/40 px-8 py-4 font-medium tracking-wide transition hover:border-white hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
