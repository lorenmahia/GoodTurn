import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Post a job and enter details",
    body: "Describe the work, pick a category, estimate the hours, set your price. We show you the category minimum as you type.",
  },
  {
    n: "02",
    title: "Receive applications",
    body: "Applicants arrive ranked by match. Filter them, wishlist the promising ones, and deny the rest without a conversation.",
  },
  {
    n: "03",
    title: "Accept, and work begins",
    body: "Accept a freelancer and the job moves to in progress. You are both logged in to Goodturn Connect to work together.",
  },
];

export default function HowItWorksStrip() {
  return (
    <section className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal variant="fade-up">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Three steps from posting to progress
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} variant="tilt" delay={i * 120}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                <p className="text-5xl font-extrabold text-accent/30">{step.n}</p>
                <h3 className="mt-4 text-xl font-bold text-brand">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-600">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fade-up" className="mt-12">
          <Link
            href="/how-it-works"
            className="font-semibold text-brand underline-offset-4 hover:text-accent hover:underline"
          >
            See the full workflow, including payment and completion →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
