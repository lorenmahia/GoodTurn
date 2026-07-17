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
                A world-class learning system built for every level of knowledge,
                from beginners to industry experts.
              </p>
            </Reveal>

            <Reveal variant="left" delay={120}>
              <div className="mt-10">
                <h3 className="text-xl font-semibold">Want to learn …</h3>
                <p className="mt-3 leading-relaxed text-neutral-200">
                  Browse over 100 categories of certificates offered through
                  LinkedIn, Google Certificates, universities and our own expert
                  material. Each certificate earned gets you closer to better paying
                  jobs.
                </p>
              </div>
            </Reveal>

            <Reveal variant="left" delay={210}>
              <div className="mt-8">
                <h3 className="text-xl font-semibold">Already an expert …</h3>
                <p className="mt-3 leading-relaxed text-neutral-200">
                  Get paid to teach freelancers on the topic of your expertise across
                  20 topic categories and hundreds of subcategories. You choose the
                  amount and rate you are paid, post your experience and designs to
                  your board, and chat with potential customers through Goodturn
                  Connect.
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
