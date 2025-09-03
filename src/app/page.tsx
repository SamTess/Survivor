import { HeroSection } from "@/components/hero-section";
import { FeaturedStartups } from "@/components/home/FeaturedStartups";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { LatestNews } from "@/components/home/LatestNews";
import { WhyJoin } from "@/components/home/WhyJoin";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Root() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-y-auto">
      <main className="flex-1">
        <HeroSection />
        <FeaturedStartups />
        <UpcomingEvents />
        <LatestNews />
        <WhyJoin />
        <FinalCTA />
      </main>
    </div>
  );
}