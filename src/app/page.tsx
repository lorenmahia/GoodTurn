import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import { prisma } from "@/lib/db";
import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";
import ForClientsSection from "@/components/home/ForClientsSection";
import HowItWorksStrip from "@/components/home/HowItWorksStrip";
import ForFreelancersSection from "@/components/home/ForFreelancersSection";

export const revalidate = 3600;

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
      <ForClientsSection />
      <HowItWorksStrip />
      <ForFreelancersSection />
      <LearnSection />
      <ConnectSection />
    </>
  );
}
