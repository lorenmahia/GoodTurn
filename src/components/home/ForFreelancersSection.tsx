import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function ForFreelancersSection() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="zoom">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-2xl shadow-ink/20">
              <Image
                src="/images/home/freelancer.jpg"
                alt="A freelancer working at their workstation"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div>
            <Reveal variant="right">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Work with us
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
                Real work, fairly paid, with training that pays off
              </h2>
            </Reveal>

            <Reveal variant="right" delay={90}>
              <div className="mt-10">
                <h3 className="text-xl font-bold text-brand">Real paid work</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  We bring in the clients and the briefs; you do the work. No bidding,
                  no paying to apply — you join a delivery team and get assigned real,
                  paid tasks that fit your skills.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={180}>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-brand">Fair pay, on time</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  We publish a fair-pay floor that sits above the market median, and
                  we pay it — verifiably, on schedule. What you earn is reported in
                  our public Transparency Report, not hidden.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={270}>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-brand">Training that leads to work</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  Goodturn Learn trains you to the exact standard our clients need —
                  and the work is waiting at the end of it, from us. Build a verified
                  track record and move into higher-value teams.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={360}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="rounded-lg bg-ink px-8 py-4 font-semibold tracking-wide text-white transition hover:bg-neutral-700"
                >
                  Join our teams
                </Link>
                <Link
                  href="/learn"
                  className="rounded-lg bg-accent px-8 py-4 font-medium tracking-wide text-white transition hover:opacity-90"
                >
                  About Goodturn Learn
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
