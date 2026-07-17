import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";

export type StatsBandProps = {
  openJobs: number;
  categories: number;
  members: number;
};

const VALUE_TILES = [
  {
    title: "You set the price",
    body: "Name your budget. Category minimums keep offers fair, nothing more.",
  },
  {
    title: "AI-matched applicants",
    body: "Applicants ranked against your brief by skills and certifications.",
  },
  {
    title: "Global payments",
    body: "Visa, Mastercard, PayPal, Mpesa and crypto wallets, on secure checkout.",
  },
];

export default function StatsBand({
  openJobs,
  categories,
  members,
}: StatsBandProps) {
  const stats = [
    { label: "Open jobs", value: openJobs },
    { label: "Skill categories", value: categories },
    { label: "Members", value: members },
  ];

  return (
    <section className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} variant="fade-up" delay={i * 90}>
              <div className="text-center">
                <p className="text-5xl font-extrabold text-accent sm:text-6xl">
                  <CountUp to={stat.value} />
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.15em] text-neutral-400">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

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
