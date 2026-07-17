import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function ForClientsSection() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal variant="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            For clients
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            The work gets done properly, or it doesn&apos;t get marked done
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Goodturn Jobs is built around one idea: you should be able to describe
            what you need, name a fair price, and get applicants who are actually
            equipped to deliver it.
          </p>
        </Reveal>

        <div className="mt-20 grid items-center gap-12 md:grid-cols-2">
          <Reveal variant="left">
            <h3 className="text-2xl font-bold text-brand">
              A large, high-quality freelancer skillset
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-700">
              Our freelancers cover a wide variety of skillsets, enough to make
              almost any work that can be done online possible. We also provide
              in-app specialists who support freelancers as they work, which lifts
              the quality of what you get back. Our learn-with-us programme keeps
              freelancers ready for whatever your job description asks of them.
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
              Matched by AI, ranked by certification
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-700">
              Our platform screens freelancers on their educational background and
              skill set, then matches them against your job posting through our
              artificial intelligence system so you get the best match possible.
              Freelancers are encouraged to keep learning and earning new
              certificates, and every certificate they earn boosts their ranking
              against jobs like yours.
            </p>
          </Reveal>
        </div>

        <Reveal variant="tilt" className="mt-24">
          <div className="rounded-2xl bg-ink p-10 text-white shadow-2xl shadow-ink/30 sm:p-14">
            <h3 className="text-3xl font-bold">You set the price</h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-neutral-300">
              You are responsible for setting your own price for the job. For each
              category there is a minimum, worked out from the number of hours you
              estimate and the complexity of the job. That minimum is not a fee we
              take. It exists so the posting is worth a good freelancer&apos;s time,
              which is the difference between a job that attracts applicants and one
              that sits untouched.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/post-a-job"
                className="rounded-lg bg-brand px-8 py-4 font-semibold tracking-wide transition hover:bg-accent"
              >
                Post a Job
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-white/40 px-8 py-4 font-medium tracking-wide transition hover:border-white hover:bg-white/10"
              >
                How it Works
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
