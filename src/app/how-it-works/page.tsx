const STEPS: { title: string; body: string[]; dark?: boolean }[] = [
  {
    title: "Tell us the outcome you need",
    body: [
      "Book a call, or start from a fixed-price service on our Services page. We scope the work with you: what “done” looks like, by when, and to what quality standard.",
      "You deal with one accountable delivery lead — not a pool of applicants to sift, and no one to line-manage.",
    ],
  },
  {
    title: "We build the brief and the team",
    dark: true,
    body: [
      "Your delivery lead writes a complete brief: worked examples, edge-case rules, and a clear definition of done, plus a rule for what to do when something is unclear.",
      "We assemble a vetted team, trained to your spec through Goodturn Learn and paid at or above our published fair-pay floor.",
    ],
  },
  {
    title: "Structured delivery, checked as it goes",
    body: [
      "Work is delivered through Goodturn Connect and reviewed against the brief before it reaches you, with reason-coded quality decisions and a full audit trail.",
      "Questions are batched into a daily digest with a recommended action already taken, so you confirm rather than unblock — you are never the bottleneck.",
    ],
  },
  {
    title: "Approved, delivered, guaranteed",
    dark: true,
    body: [
      "You approve finished work and receive a quality record you can audit, plus one clean invoice with compliance — eTIMS, withholding tax — handled for you.",
      "If we miss the standard we agreed, we rework it at our cost. The guarantee is contractual, not a slogan.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-4xl font-extrabold">How it works</h1>
          <p className="mt-4 max-w-3xl text-lg text-neutral-200">
            Goodturn is a managed delivery service. You brief us and get finished, checked work back —
            with verified fair pay, compliance handled, and a delivery guarantee we stand behind.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold">From brief to delivered</h2>
        <ol className="mt-12 space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-6">
              <span className="text-5xl font-extrabold text-neutral-400">{i + 1}</span>
              <div
                className={`flex-1 rounded-2xl p-8 ${
                  step.dark ? "bg-ink text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                <h3 className={`text-xl font-bold ${step.dark ? "text-white" : "text-brand"}`}>{step.title}</h3>
                {step.body.map((p, j) => (
                  <p key={j} className={`mt-3 leading-relaxed ${step.dark ? "text-neutral-300" : ""}`}>
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold">If something goes wrong</h2>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Enforcement is part of the service, not an afterthought. Every engagement comes with a
            documented path when work slips.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="font-bold text-brand">A named escalation contact</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                You always have a named delivery lead with a response-time SLA — and a clear escalation
                matrix above them if you need it.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="font-bold text-brand">Service credits, applied by us</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                If we breach an SLA, we apply the agreed service credit before you have to ask for it.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="font-bold text-brand">Rework at our cost</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                Work that misses the standard we agreed is reworked at our expense — that is what the
                guarantee means.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="font-bold text-brand">Guaranteed continuity</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                If someone on your team is unavailable, we substitute a trained replacement — delivery
                does not stop.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
