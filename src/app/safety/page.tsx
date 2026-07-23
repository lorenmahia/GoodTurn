import GuaranteeBanner from "@/components/GuaranteeBanner";

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand dark:text-accent">Trust &amp; Safety on Goodturn</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Goodturn is built so you can work with people you don&apos;t know yet — safely.
      </p>

      <div className="mt-6">
        <GuaranteeBanner />
      </div>

      <section className="mt-8 space-y-4 text-neutral-800 dark:text-neutral-200">
        <div>
          <h2 className="font-bold">You never pay to work</h2>
          <p className="mt-1 text-sm">
            Applying is free and always will be. No one on Goodturn should ever ask you for a &quot;registration fee&quot;,
            &quot;training fee&quot;, or any payment to get a job. Money only ever flows to you.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Keep it on Goodturn</h2>
          <p className="mt-1 text-sm">
            Chat, hiring, and delivery happen here. You never need to share your phone number or email — Goodturn Connect
            carries your conversation. Anyone pushing you to move off-platform is a red flag.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Report anything suspicious</h2>
          <p className="mt-1 text-sm">
            Every job has a &quot;Report this job&quot; option. When enough people report a listing, we hide it from Goodturn
            automatically while we review it.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Look for the badge</h2>
          <p className="mt-1 text-sm">
            An <span className="font-semibold">Established employer</span> has already completed at least one hire on
            Goodturn. It&apos;s a signal — always use the guarantee and reporting tools regardless.
          </p>
        </div>
      </section>
    </div>
  );
}
