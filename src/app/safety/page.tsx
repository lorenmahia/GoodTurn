import GuaranteeBanner from "@/components/GuaranteeBanner";

export default function FairWorkPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Trust &amp; Fair Work</p>
      <h1 className="mt-3 text-3xl font-extrabold text-brand dark:text-accent">Fair work, proven — not promised</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Good outcomes come from people who are treated well — and the difference here is that we can show it.
      </p>

      <section className="mt-8 space-y-4 text-neutral-800 dark:text-neutral-200">
        <div>
          <h2 className="font-bold">Verified fair pay</h2>
          <p className="mt-1 text-sm">
            We publish a fair-pay floor that sits above the local market median, and we pay it —
            verifiably. What we pay is reported, not buried.
          </p>
        </div>
        <div>
          <h2 className="font-bold">A public Transparency Report</h2>
          <p className="mt-1 text-sm">
            Each quarter we publish median worker earnings, our pay floor, the share of revenue that goes
            to workers and delivery, defect rates and dispute-resolution times. If a number is bad, we
            publish it anyway — that is what makes the rest credible.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Compliance handled</h2>
          <p className="mt-1 text-sm">
            eTIMS invoicing and withholding tax are handled for you — one clean invoice, zero exposure. You
            carry no worker-classification or local-tax risk.
          </p>
        </div>
        <div>
          <h2 className="font-bold">EU-standard data protection</h2>
          <p className="mt-1 text-sm">
            Your data is handled to EU-standard protection, with a data-processing agreement and a clear
            security posture. We can tell you exactly where your data lives and who touches it.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Named, credited — never sold</h2>
          <p className="mt-1 text-sm">
            The people doing your work are named and credited, with a quality record you can see. Personal
            contact details are never exchanged — identity on Goodturn is a Goodturn identity, which
            protects everyone.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <GuaranteeBanner />
      </div>
    </div>
  );
}
