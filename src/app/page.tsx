import { prisma } from "@/lib/db";
import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";
import ForClientsSection from "@/components/home/ForClientsSection";
import HowItWorksStrip from "@/components/home/HowItWorksStrip";
import ForFreelancersSection from "@/components/home/ForFreelancersSection";
import LearnSection from "@/components/home/LearnSection";
import ConnectSection from "@/components/home/ConnectSection";
import FinalCtaBand from "@/components/home/FinalCtaBand";

export const revalidate = 3600;

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
      <FinalCtaBand />
    </>
  );
}
