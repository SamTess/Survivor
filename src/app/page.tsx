"use client";

import React from "react";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedStartups } from "@/components/home/FeaturedStartups";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { LatestNews } from "@/components/home/LatestNews";
import { WhyJoin } from "@/components/home/WhyJoin";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Root() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`h-screen flex flex-col bg-background overflow-y-auto ${!isMobile ? 'snap-y snap-mandatory' : ''}`}>
      <main className="flex-1">
        <section className={!isMobile ? 'snap-start' : ''}>
          <HeroSection />
        </section>
        <section className={!isMobile ? 'snap-center' : ''}>
          <FeaturedStartups />
        </section>
        <section className={!isMobile ? 'snap-center' : ''}>
          <UpcomingEvents />
        </section>
        <section className={!isMobile ? 'snap-center' : ''}>
          <LatestNews />
        </section>
        <section className={!isMobile ? 'snap-center' : ''}>
          <WhyJoin />
        </section>
        <section className={!isMobile ? 'snap-start' : ''}>
          <FinalCTA />
        </section>
      </main>
    </div>
  );
}