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
                Connect with users anywhere through video, call, chat and SMS
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-700">
                You are going to apply for jobs all over the world. You should still
                feel connected to your customers as though you were in the room with
                them. Goodturn Connect gives you team management and direct messaging
                so nothing gets lost between kickoff and completion.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <p className="mt-6 font-semibold leading-relaxed text-brand">
                Please note: you will be automatically logged in to Goodturn Connect
                when you post a job or are accepted for a job. Use your Account ID to
                sign up to the Goodturn Connect platform. Your ID can be found on the
                Accounts page.
              </p>
              <div className="mt-8">
                <ComingSoon
                  label="Go to Connect"
                  note="Goodturn Connect is coming soon — stay tuned!"
                />
              </div>
            </Reveal>
          </div>

          <Reveal variant="tilt">
            <div className="rounded-2xl bg-gradient-to-br from-brand via-[#2a3568] to-ink p-10 text-white shadow-2xl shadow-ink/20">
              <p className="text-lg font-semibold">
                Team management, direct messaging, file sharing and in-app APIs
              </p>
              <p className="mt-3 leading-relaxed text-neutral-300">
                The Goodturn Connect Workstation keeps you and your clients on the
                same page from kickoff to completion.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
