"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
  <section className="pt-14 pb-20 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-4 text-center relative">
  <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to accelerate your startup?</h2>
  <p className="text-muted-foreground text-lg mb-8">Join an ecosystem built to support every stage of your growth — from idea to scale.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="px-8 text-base">Create an account <ArrowRight className="ml-2 h-5 w-5" /></Button>
          <Button variant="outline" size="lg" className="px-8 text-base bg-background/50 backdrop-blur-sm">Explore the platform</Button>
        </div>
      </div>
    </section>
  );
}
