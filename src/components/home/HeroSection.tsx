"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background to-muted pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Accelerating the Future of <span className="text-primary">Innovation</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Join our thriving ecosystem of startups, investors, and mentors. We provide the resources, network, and
            expertise to transform your vision into reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={"/projects"}>
              <Button size="lg" className="text-lg px-8">
                Explore Startups
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={"/signup?"}>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Apply to Join
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">150+</div>
              <div className="text-muted-foreground">Startups Launched</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">500+</div>
              <div className="text-muted-foreground">Entrepreneurs</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">$50M+</div>
              <div className="text-muted-foreground">Funding Raised</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
