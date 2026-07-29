import ComingSoon from "@/components/ComingSoon";
import Reveal from "@/components/motion/Reveal";

export default function ConnectSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <Reveal variant="fade-up">
              <h2 className="text-4xl font-extrabold sm:text-5xl">Goodturn Connect</h2>
              <h3 className="mt-4 text-xl font-bold text-brand">
                Where the work happens — and gets proven
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-700">
                Connect is your delivery record, not a chat app. Every brief,
                submission and review sits in one place, with reason-coded quality
                decisions and an audit trail you can rely on. You always know who did
                what, when, and to what standard.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <p className="mt-6 font-semibold leading-relaxed text-brand">
                You get one accountable delivery lead, a live dashboard, a daily
                digest of progress, and a monthly business review where the numbers
                are on the table — no line-management, no chasing.
              </p>
              <div className="mt-8">
                <ComingSoon
                  label="See a sample delivery report"
                  note="The Goodturn Connect delivery portal is rolling out to clients — talk to us for a walkthrough."
                />
              </div>
            </Reveal>
          </div>

          <Reveal variant="tilt">
            <div className="rounded-2xl bg-gradient-to-br from-brand via-[#2a3568] to-ink p-10 text-white shadow-2xl shadow-ink/20">
              <p className="text-lg font-semibold">
                Structured briefs, submissions, reason-coded reviews and an audit
                trail
              </p>
              <p className="mt-3 leading-relaxed text-neutral-300">
                Connect turns delivery into evidence: every decision is logged and
                explainable, so quality is something you can see — and we can prove.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
