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
                For freelancers
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
                Work you&apos;re actually suited to, paid the way you want
              </h2>
            </Reveal>

            <Reveal variant="right" delay={90}>
              <div className="mt-10">
                <h3 className="text-xl font-bold text-brand">Find your best match</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  Search the board yourself, or hit Find Best Match and let us rank
                  every open job against the skills on your profile. The better your
                  profile, the better the ranking.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={180}>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-brand">A fast payment system</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  We accept Visa, Mastercard, PayPal, Mpesa and all crypto wallets,
                  so your mode of payment is available globally. Our secure checkout
                  system guarantees your money&apos;s safety.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={270}>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-brand">Grow into better work</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">
                  Every certificate you earn through Goodturn Learn lifts your
                  ranking against the jobs you want. Learning is how you move up the
                  list, not just how you fill time between contracts.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={360}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/find-work"
                  className="rounded-lg bg-ink px-8 py-4 font-semibold tracking-wide text-white transition hover:bg-neutral-700"
                >
                  Find Work
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-lg bg-accent px-8 py-4 font-medium tracking-wide text-white transition hover:opacity-90"
                >
                  How it Works
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
