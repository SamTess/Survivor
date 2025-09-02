import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProjects } from "@/components/featured-projects"

export default function Root() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturedProjects />
      </main>
    </div>
  )
}