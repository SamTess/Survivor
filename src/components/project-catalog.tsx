"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ExternalLink, MapPin, Calendar, Search, Filter, SortAsc, X, Users, DollarSign } from "lucide-react"
import Link from "next/link"

const allProjects = [
  {
    id: 1,
    name: "EcoTech Solutions",
    description:
      "Revolutionary sustainable technology for clean energy production and storage using advanced battery systems.",
    sector: "CleanTech",
    stage: "Series A",
    location: "San Francisco, CA",
    founded: "2022",
    funding: "$2.5M",
    teamSize: 12,
    image: "/sustainable-technology-clean-energy.png",
  },
  {
    id: 2,
    name: "HealthAI",
    description: "AI-powered diagnostic tools for early disease detection and personalized treatment recommendations.",
    sector: "HealthTech",
    stage: "Seed",
    location: "Boston, MA",
    founded: "2023",
    funding: "$1.2M",
    teamSize: 8,
    image: "/medical-ai-diagnostic-technology.png",
  },
  {
    id: 3,
    name: "FinFlow",
    description: "Next-generation financial platform for small business cash flow management and automated invoicing.",
    sector: "FinTech",
    stage: "Pre-Seed",
    location: "New York, NY",
    founded: "2023",
    funding: "$500K",
    teamSize: 5,
    image: "/financial-technology-dashboard.png",
  },
  {
    id: 4,
    name: "AgriSmart",
    description: "IoT-based precision agriculture platform for optimizing crop yields and reducing resource waste.",
    sector: "AgTech",
    stage: "Seed",
    location: "Austin, TX",
    founded: "2022",
    funding: "$1.8M",
    teamSize: 15,
    image: "/smart-agriculture-iot-sensors.png",
  },
  {
    id: 5,
    name: "EduVerse",
    description: "Virtual reality educational platform creating immersive learning experiences for students worldwide.",
    sector: "EdTech",
    stage: "Series A",
    location: "Seattle, WA",
    founded: "2021",
    funding: "$3.2M",
    teamSize: 20,
    image: "/virtual-reality-education-classroom.png",
  },
  {
    id: 6,
    name: "CyberShield",
    description: "Advanced cybersecurity solutions for small and medium enterprises with AI-powered threat detection.",
    sector: "CyberSecurity",
    stage: "Seed",
    location: "Denver, CO",
    founded: "2023",
    funding: "$900K",
    teamSize: 7,
    image: "/cybersecurity-shield.png",
  },
  {
    id: 7,
    name: "SpaceLogistics",
    description: "Satellite-based logistics tracking and optimization for global supply chain management.",
    sector: "SpaceTech",
    stage: "Pre-Seed",
    location: "Los Angeles, CA",
    founded: "2023",
    funding: "$750K",
    teamSize: 6,
    image: "/satellite-space-logistics-tracking.png",
  },
  {
    id: 8,
    name: "BioMaterials",
    description:
      "Sustainable biomaterials for packaging industry, replacing traditional plastics with eco-friendly alternatives.",
    sector: "CleanTech",
    stage: "Seed",
    location: "Portland, OR",
    founded: "2022",
    funding: "$1.5M",
    teamSize: 10,
    image: "/sustainable-biomaterials-packaging.png",
  },
]

const sectors = ["All", "CleanTech", "HealthTech", "FinTech", "AgTech", "EdTech", "CyberSecurity", "SpaceTech"]
const stages = ["All", "Pre-Seed", "Seed", "Series A", "Series B"]
const locations = [
  "All",
  "San Francisco, CA",
  "Boston, MA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "Denver, CO",
  "Los Angeles, CA",
  "Portland, OR",
]

const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "funding-desc", label: "Funding (High to Low)" },
  { value: "funding-asc", label: "Funding (Low to High)" },
  { value: "team-desc", label: "Team Size (Large to Small)" },
  { value: "team-asc", label: "Team Size (Small to Large)" },
  { value: "founded-desc", label: "Recently Founded" },
  { value: "founded-asc", label: "Oldest First" },
]

const fundingYears = ["All", "2021", "2022", "2023", "2024"]

export function ProjectCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSector, setSelectedSector] = useState("All")
  const [selectedStage, setSelectedStage] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedFundingYear, setSelectedFundingYear] = useState("All")
  const [fundingRange, setFundingRange] = useState([0, 5000000]) // 0 to 5M
  const [teamSizeRange, setTeamSizeRange] = useState([1, 25])
  const [sortBy, setSortBy] = useState("name")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = allProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSector = selectedSector === "All" || project.sector === selectedSector
      const matchesStage = selectedStage === "All" || project.stage === selectedStage
      const matchesLocation = selectedLocation === "All" || project.location === selectedLocation
      const matchesFundingYear = selectedFundingYear === "All" || project.founded === selectedFundingYear

      const fundingAmount =
        Number.parseFloat(project.funding.replace(/[$MK,]/g, "")) *
        (project.funding.includes("M") ? 1000000 : project.funding.includes("K") ? 1000 : 1)
      const matchesFundingRange = fundingAmount >= fundingRange[0] && fundingAmount <= fundingRange[1]
      const matchesTeamSize = project.teamSize >= teamSizeRange[0] && project.teamSize <= teamSizeRange[1]

      return (
        matchesSearch &&
        matchesSector &&
        matchesStage &&
        matchesLocation &&
        matchesFundingYear &&
        matchesFundingRange &&
        matchesTeamSize
      )
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "funding-desc":
          const aFunding =
            Number.parseFloat(a.funding.replace(/[$MK,]/g, "")) *
            (a.funding.includes("M") ? 1000000 : a.funding.includes("K") ? 1000 : 1)
          const bFunding =
            Number.parseFloat(b.funding.replace(/[$MK,]/g, "")) *
            (b.funding.includes("M") ? 1000000 : b.funding.includes("K") ? 1000 : 1)
          return bFunding - aFunding
        case "funding-asc":
          const aFundingAsc =
            Number.parseFloat(a.funding.replace(/[$MK,]/g, "")) *
            (a.funding.includes("M") ? 1000000 : a.funding.includes("K") ? 1000 : 1)
          const bFundingAsc =
            Number.parseFloat(b.funding.replace(/[$MK,]/g, "")) *
            (b.funding.includes("M") ? 1000000 : b.funding.includes("K") ? 1000 : 1)
          return aFundingAsc - bFundingAsc
        case "team-desc":
          return b.teamSize - a.teamSize
        case "team-asc":
          return a.teamSize - b.teamSize
        case "founded-desc":
          return Number.parseInt(b.founded) - Number.parseInt(a.founded)
        case "founded-asc":
          return Number.parseInt(a.founded) - Number.parseInt(b.founded)
        default:
          return 0
      }
    })

    return filtered
  }, [
    searchTerm,
    selectedSector,
    selectedStage,
    selectedLocation,
    selectedFundingYear,
    fundingRange,
    teamSizeRange,
    sortBy,
  ])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedSector("All")
    setSelectedStage("All")
    setSelectedLocation("All")
    setSelectedFundingYear("All")
    setFundingRange([0, 5000000])
    setTeamSizeRange([1, 25])
    setSortBy("name")
  }

  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount}`
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Search & Filter</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              {showAdvancedFilters ? "Hide" : "Show"} Advanced
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showAdvancedFilters && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Funding Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Funding Range</label>
                </div>
                <Slider
                  value={fundingRange}
                  onValueChange={setFundingRange}
                  max={5000000}
                  min={0}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatFunding(fundingRange[0])}</span>
                  <span>{formatFunding(fundingRange[1])}</span>
                </div>
              </div>

              {/* Team Size Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Team Size</label>
                </div>
                <Slider
                  value={teamSizeRange}
                  onValueChange={setTeamSizeRange}
                  max={25}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{teamSizeRange[0]} people</span>
                  <span>{teamSizeRange[1]} people</span>
                </div>
              </div>

              {/* Founded Year */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Founded Year</label>
                <Select value={selectedFundingYear} onValueChange={setSelectedFundingYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count and Sorting */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredAndSortedProjects.length} of {allProjects.length} projects
        </p>
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{project.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
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
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Funding: {project.funding}</span>
                  <span className="text-xs">Team: {project.teamSize}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full group bg-transparent">
                <Link href={`/projects/${project.id}`} className="flex items-center gap-2">
                  View Details
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">No projects found matching your criteria</p>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}
