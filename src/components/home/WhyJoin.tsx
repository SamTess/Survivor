"use client";

import { Users, Network, ShieldCheck, Zap } from "lucide-react";

const features = [
  { icon: Users, title: "Community", desc: "An active network of founders, mentors and investors." },
  { icon: Zap, title: "Acceleration", desc: "Access resources, templates, feedback loops and expert sessions." },
  { icon: Network, title: "Visibility", desc: "Showcase your startup to qualified ecosystem stakeholders." },
  { icon: ShieldCheck, title: "Trust", desc: "Structured processes, secure data and responsive support." },
];

export function WhyJoin() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(circle_at_center,white,transparent)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
  <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">Why <span className="text-primary">join us</span>?</h2>
  <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">We help startups save time, build credibility and accelerate go-to-market with an integrated platform and targeted support.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><f.icon className="h-6 w-6" /></div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
