import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function LearnSection() {
  return (
    <section className="bg-brand py-24 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Reveal variant="left">
              <h2 className="text-4xl font-extrabold sm:text-5xl">Goodturn Learn</h2>
              <p className="mt-4 max-w-xl text-lg text-neutral-200">
                The training arm of a work platform — the skills the work actually
                needs, with real paid work at the end of it.
              </p>
            </Reveal>

            <Reveal variant="left" delay={120}>
              <div className="mt-10">
                <h3 className="text-xl font-semibold">For businesses</h3>
                <p className="mt-3 leading-relaxed text-neutral-200">
                  We train a team to your exact spec, so they are productive on day
                  one. If you employ staff in Kenya, we can help you put your NITA
                  training levy — money you already pay — toward it, so your net cost
                  can be close to nothing.
                </p>
              </div>
            </Reveal>

            <Reveal variant="left" delay={210}>
              <div className="mt-8">
                <h3 className="text-xl font-semibold">For workers</h3>
                <p className="mt-3 leading-relaxed text-neutral-200">
                  Free, mobile-first training that leads to real paid work with us —
                  not a certificate that goes nowhere. Prove you can do a specific
                  job, then get assigned to a delivery team.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <Link
                href="/learn"
                className="mt-10 inline-block rounded-lg bg-ink px-8 py-4 font-semibold text-white transition hover:bg-neutral-700"
              >
                Go to Learn Page
              </Link>
            </Reveal>
          </div>

          <Reveal variant="zoom">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl shadow-ink/40">
              <Image
                src="/images/home/learn.jpg"
                alt="A person studying an online course"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
