import HeroSection from "@/components/home/HeroSection";
import StatsBand from "@/components/home/StatsBand";
import ForClientsSection from "@/components/home/ForClientsSection";
import HowItWorksStrip from "@/components/home/HowItWorksStrip";
import ForFreelancersSection from "@/components/home/ForFreelancersSection";
import LearnSection from "@/components/home/LearnSection";
import ConnectSection from "@/components/home/ConnectSection";
import FinalCtaBand from "@/components/home/FinalCtaBand";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBand />
      <ForClientsSection />
      <HowItWorksStrip />
      <ForFreelancersSection />
      <LearnSection />
      <ConnectSection />
      <FinalCtaBand />
    </>
  );
}
