import Image from "next/image";
import Link from "next/link";
import ParallaxLayer from "@/components/motion/ParallaxLayer";
import Reveal from "@/components/motion/Reveal";

export default function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden bg-ink text-white">
      {/* Photo + scrim: h-[150%] gives 50vh of overflow, which is exactly the
          max offset at speed 0.5, so the frame stays covered as it scrolls. */}
      <ParallaxLayer speed={0.5} className="absolute inset-x-0 top-0 h-[150%]">
        <Image
          src="/images/home/hero.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-brand/50" />
      </ParallaxLayer>

      <ParallaxLayer
        speed={0.7}
        className="absolute inset-x-0 bottom-0 h-[130%] pointer-events-none"
      >
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full opacity-40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path fill="#0b1526" d="M0 320 320 96l224 160L768 64l288 192 176-128 208 160v32H0Z" />
          <path fill="#10203a" d="m0 320 256-128 192 96 256-192 320 224 224-160 192 160H0Z" />
        </svg>
      </ParallaxLayer>

      <ParallaxLayer
        speed={0.85}
        className="relative flex h-full items-center"
      >
        <div className="mx-auto w-full max-w-6xl px-4">
          <Reveal variant="fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Managed remote teams from Kenya
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={90}>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              Outcomes delivered, guaranteed — not hours sold
            </h1>
          </Reveal>

          <Reveal variant="fade-up" delay={180}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-200">
              Managed remote teams from Kenya, with EU-standard data protection,
              verified fair pay, and a delivery guarantee we contractually stand
              behind. You brief us and get finished work back — one accountable
              delivery lead, a named team you can see, and a quality record you can
              audit. No CVs to sift, no one to line-manage.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={270}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="rounded-lg bg-brand px-8 py-4 text-lg font-semibold tracking-wide shadow-lg shadow-ink/40 transition hover:bg-accent"
              >
                See our services
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border border-white/40 px-8 py-4 text-lg font-medium tracking-wide transition hover:border-white hover:bg-white/10"
              >
                Book a call
              </Link>
            </div>
          </Reveal>
        </div>
      </ParallaxLayer>

      <div
        className="absolute inset-x-0 bottom-8 flex justify-center"
        aria-hidden
      >
        <svg
          className="h-6 w-6 animate-bounce text-white/60"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
