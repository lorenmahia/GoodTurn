import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";

const VALUE_TILES = [
  {
    title: "Verified fair pay",
    body: "A published pay floor above the market median — and a public Transparency Report that proves we pay it.",
  },
  {
    title: "Quality you can audit",
    body: "Every submission reviewed against your brief, with a reason-coded record you can see.",
  },
  {
    title: "Compliance handled",
    body: "eTIMS, withholding tax and one clean invoice. EU-standard data protection throughout.",
  },
];

export default function StatsBand() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          <Reveal variant="fade-up">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-accent sm:text-6xl">
                KES <CountUp to={45000} />
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.15em] text-neutral-400">
                Fair-pay floor / month
              </p>
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={90}>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-accent sm:text-6xl">
                <CountUp to={53} />%
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.15em] text-neutral-400">
                Of revenue to workers &amp; delivery
              </p>
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={180}>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-accent sm:text-6xl">&lt; 2%</p>
              <p className="mt-2 text-sm uppercase tracking-[0.15em] text-neutral-400">
                Target defect rate
              </p>
            </div>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-500">
          Targets and commitments — published quarterly in our Transparency Report.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {VALUE_TILES.map((tile, i) => (
            <Reveal key={tile.title} variant="tilt" delay={i * 90}>
              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-bold text-white">{tile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                  {tile.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
