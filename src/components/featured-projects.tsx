"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

const featuredProjects = [
  {
    id: 1,
    name: "EcoTech Solutions",
    description: "Revolutionary sustainable technology for clean energy production and storage.",
    sector: "CleanTech",
    stage: "Series A",
    location: "San Francisco, CA",
    founded: "2022",
    funding: "$2.5M",
    image: "/sustainable-technology-clean-energy.png",
  },
  {
    id: 2,
    name: "HealthAI",
    description: "AI-powered diagnostic tools for early disease detection and personalized treatment.",
    sector: "HealthTech",
    stage: "Seed",
    location: "Boston, MA",
    founded: "2023",
    funding: "$1.2M",
    image: "/medical-ai-diagnostic-technology.png",
  },
  {
    id: 3,
    name: "FinFlow",
    description: "Next-generation financial platform for small business cash flow management.",
    sector: "FinTech",
    stage: "Pre-Seed",
    location: "New York, NY",
    founded: "2023",
    funding: "$500K",
    image: "/financial-technology-dashboard.png",
  },
]

export function FeaturedProjects() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Startups</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover innovative companies that are shaping the future across various industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project) => (
            <Card key={project.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{project.sector}</Badge>
                  <Badge variant="outline">{project.stage}</Badge>
                </div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription className="text-sm">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Founded {project.founded}
                  </div>
                  <div className="font-semibold text-foreground">Funding: {project.funding}</div>
                </div>
                <Button variant="outline" className="w-full group bg-transparent">
                  <Link href={`/projects/${project.id}`} className="flex items-center gap-2">
                    Learn More
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline">
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
