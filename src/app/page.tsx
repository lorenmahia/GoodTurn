import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import { prisma } from "@/lib/db";
import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";

export const revalidate = 3600;

function JobsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <h2 className="text-4xl font-extrabold">Goodturn Jobs</h2>
        <div className="flex flex-col gap-3">
          <Link href="/post-a-job" className="rounded bg-ink px-6 py-3 text-center font-medium text-white hover:bg-neutral-700">Post a Job</Link>
          <Link href="/how-it-works" className="rounded bg-accent px-6 py-3 text-center font-medium text-white hover:opacity-90">How it Works</Link>
        </div>
      </div>

      <h3 className="mt-6 text-2xl font-bold text-brand">To Clients</h3>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-bold text-brand">Large and High Quality Freelancer Skillset</h4>
            <p className="mt-2 leading-relaxed text-neutral-700">
              Our freelancers are highly skilled in a wide variety of skillsets that enables almost any work
              that can be done online to be made possible. We also provide in-app specialists to help
              freelancers thus increasing the quality of the work output. Our freelancer learn with us
              program also ensures that freelancers are ready for any challenges in relation to your job
              description.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-brand">High Quality Work</h4>
            <p className="mt-2 leading-relaxed text-neutral-700">
              Our platform screens freelancers based on their educational background, skill set and matches
              them to your job posting through our artificial intelligence system to ensure you get the best
              match possible. Users are encouraged to learn constantly and acquire new certificates which
              boosts their ranking.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-ink p-8 text-white">
          <h4 className="text-xl font-bold">You Set the Price</h4>
          <p className="mt-3 leading-relaxed text-neutral-300">
            You are responsible for setting your own price for the Job. However, for each category, depending
            on the number of hours estimated for the job and job complexity, there is a minimum amount
            required in order to encourage freelancers to apply for your Job.
          </p>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap items-start justify-between gap-6">
        <h3 className="text-2xl font-bold text-brand">To Freelancers</h3>
        <div className="flex flex-col gap-3">
          <Link href="/find-work" className="rounded bg-ink px-6 py-3 text-center font-medium text-white hover:bg-neutral-700">Find Work</Link>
          <Link href="/how-it-works" className="rounded bg-accent px-6 py-3 text-center font-medium text-white hover:opacity-90">How it Works</Link>
        </div>
      </div>
      <div className="mt-6 max-w-xl">
        <h4 className="text-xl font-bold text-brand">Fast Payment System</h4>
        <p className="mt-2 leading-relaxed text-neutral-700">
          We accept Visa, Mastercard, PayPal, Mpesa and all Crypto Wallets ensuring that your mode of payment
          is available globally. In addition, our secure checkout system guarantees your money&apos;s safety.
        </p>
      </div>
    </section>
  );
}

function LearnSection() {
  return (
    <section className="bg-brand text-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-4xl font-extrabold">Goodturn Learn</h2>
        <p className="mt-4 max-w-2xl text-lg text-neutral-200">
          A World Class Learning system designed to teach all levels of Knowledge from beginners to industry
          experts.
        </p>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">Want to Learn …</h3>
            <p className="mt-3 leading-relaxed text-neutral-200">
              Browse over 100 different categories for certificates offered through Linkedin, Google
              Certificates, Universities and our own expert material. Each certificate earned gets you closer
              to better paying Jobs.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Already an Expert …</h3>
            <p className="mt-3 leading-relaxed text-neutral-200">
              Through Goodturn Learn, you get paid to teach freelancers on the topic of your expertise. We
              feature 20 different Topic categories with hundreds of subcategories to ensure your experience
              and knowledge are well compensated for.
            </p>
            <p className="mt-3 leading-relaxed text-neutral-200">
              You choose the amount and rate you are paid, have a board where you post your experience or
              designs and chat with potential customers via Goodturn Connect.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link href="/learn" className="inline-block rounded bg-ink px-8 py-3 font-medium text-white hover:bg-neutral-700">
            Go to Learn Page
          </Link>
        </div>
      </div>
    </section>
  );
}

function ConnectSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center text-4xl font-extrabold">Goodturn Connect</h2>
      <div className="mt-12 grid items-start gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-brand">Connect With Users anywhere through Video, call, chat and SMS</h3>
          <p className="mt-3 leading-relaxed text-neutral-700">
            We know you are eager to apply for jobs all over the world. We want you to feel connected to your
            customers as though you are in person.
          </p>
          <p className="mt-3 leading-relaxed text-neutral-700">
            Goodturn connect allows you to gain the best experience through our team management and direct
            messaging features.
          </p>
          <p className="mt-4 font-semibold leading-relaxed text-brand">
            Please Note: You will be automatically logged in to Goodturn Connect when you Post a Job or are
            Accepted for a job. Use your Account ID to sign up to the Goodturn Connect Platform. Your ID can
            be found in the Accounts page.
          </p>
          <div className="mt-8">
            <ComingSoon label="Go to Connect" note="Goodturn Connect is coming soon — stay tuned!" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-brand via-[#2a3568] to-ink p-10 text-white">
          <p className="text-lg font-semibold">Team management, direct messaging, file sharing and in-app APIs</p>
          <p className="mt-3 text-neutral-300">
            The Goodturn Connect Workstation keeps you and your clients on the same page from kickoff to
            completion.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [openJobs, categories, members] = await Promise.all([
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.category.count(),
    prisma.user.count(),
  ]);

  return (
    <>
      <HeroSection />
      <StatsBand openJobs={openJobs} categories={categories} members={members} />
      <JobsSection />
      <LearnSection />
      <ConnectSection />
    </>
  );
}
