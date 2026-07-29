import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Brief us",
    body: "Tell us the outcome you need. Your delivery lead turns it into a complete brief — worked examples, edge cases, and a clear definition of done.",
  },
  {
    n: "02",
    title: "We deliver",
    body: "A vetted, fairly-paid team does the work. Every piece is reviewed against the brief, with a reason-coded quality record, before it reaches you.",
  },
  {
    n: "03",
    title: "You get finished work, guaranteed",
    body: "Approved work, on time, with a quality record you can audit and a guarantee we contractually stand behind. If we miss the standard, that is on us.",
  },
];

export default function HowItWorksStrip() {
  return (
    <section className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal variant="fade-up">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Three steps from brief to delivered
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
            See the full workflow, including quality checks and dispute resolution →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
