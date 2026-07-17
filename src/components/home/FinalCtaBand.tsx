import Image from "next/image";
import Link from "next/link";
import ParallaxLayer from "@/components/motion/ParallaxLayer";
import Reveal from "@/components/motion/Reveal";

export default function FinalCtaBand() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* bottom-0 puts the 30% overflow ABOVE the frame: the layer drifts
          downward as the band scrolls in, so the coverage must be up top. */}
      <ParallaxLayer speed={0.7} className="absolute inset-x-0 bottom-0 h-[130%]">
        <Image
          src="/images/home/cta.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-brand/50" />
      </ParallaxLayer>

      <div className="relative mx-auto max-w-6xl px-4 py-32">
        <Reveal variant="fade-up">
          <h2 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Post your first job today
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-200">
            Describe the work, set your price, and see who applies. It costs nothing
            to find out what the right freelancer would do with it.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/post-a-job"
              className="rounded-lg bg-brand px-8 py-4 text-lg font-semibold tracking-wide shadow-lg shadow-ink/40 transition hover:bg-accent"
            >
              Post a Job
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/40 px-8 py-4 text-lg font-medium tracking-wide transition hover:border-white hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
