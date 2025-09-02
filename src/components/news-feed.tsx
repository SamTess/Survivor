"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Filter, ExternalLink, TrendingUp, Award, Users, Megaphone } from "lucide-react"

// NOTE: Keep raw date strings (YYYY-MM-DD). We format them deterministically below
const newsArticles = [
  {
    id: 1,
    title: "EcoTech Solutions Raises $2.5M Series A to Scale Clean Energy Technology",
    excerpt:
      "The San Francisco-based startup will use the funding to expand manufacturing and enter European markets with their revolutionary battery storage systems.",
    category: "Funding",
    date: "2024-01-15",
    readTime: "3 min read",
  image: "/sustainable-technology-clean-energy.png",
    author: "Sarah Johnson",
    featured: true,
  },
  {
    id: 2,
    title: "StartupHub Announces Q1 2024 Demo Day - Applications Now Open",
    excerpt:
      "Join us for our quarterly showcase where 12 selected startups will pitch to leading investors and industry experts. Application deadline: March 1st.",
    category: "Events",
    date: "2024-01-12",
    readTime: "2 min read",
  image: "/virtual-reality-education-classroom.png",
    author: "Michael Chen",
    featured: false,
  },
  {
    id: 3,
    title: "HealthAI Wins Best Healthcare Innovation at TechCrunch Disrupt",
    excerpt:
      "The AI-powered diagnostic platform impressed judges with its potential to revolutionize early disease detection in underserved communities.",
    category: "Awards",
    date: "2024-01-10",
    readTime: "4 min read",
  image: "/medical-ai-diagnostic-technology.png",
    author: "Emily Rodriguez",
    featured: true,
  },
  {
    id: 4,
    title: "New Accelerator Program Launches for Climate Tech Startups",
    excerpt:
      "Applications are now open for our specialized 12-week program focused on climate technology solutions. $100K investment and mentorship included.",
    category: "Programs",
    date: "2024-01-08",
    readTime: "3 min read",
  image: "/smart-agriculture-iot-sensors.png",
    author: "David Park",
    featured: false,
  },
  {
    id: 5,
    title: "Portfolio Company FinFlow Reaches $1M ARR Milestone",
    excerpt:
      "The fintech startup has achieved significant growth in small business cash flow management, serving over 500 companies nationwide.",
    category: "Updates",
    date: "2024-01-05",
    readTime: "2 min read",
  image: "/financial-technology-dashboard.png",
    author: "Lisa Wang",
    featured: false,
  },
  {
    id: 6,
    title: "Investor Spotlight: Meet the VCs Backing Tomorrow's Unicorns",
    excerpt:
      "An exclusive interview with three leading venture capitalists about their investment strategies and what they look for in early-stage startups.",
    category: "Insights",
    date: "2024-01-03",
    readTime: "6 min read",
  image: "/cybersecurity-shield.png",
    author: "Alex Thompson",
    featured: true,
  },
  {
    id: 7,
    title: "Women in Tech Networking Event - February 20th",
    excerpt:
      "Join female founders, investors, and tech leaders for an evening of networking, mentorship, and inspiring conversations about building inclusive startups.",
    category: "Events",
    date: "2024-01-01",
    readTime: "1 min read",
  image: "/satellite-space-logistics-tracking.png",
    author: "Rachel Green",
    featured: false,
  },
  {
    id: 8,
    title: "2024 Startup Trends: AI, Sustainability, and the Future of Work",
    excerpt:
      "Our annual report reveals the key trends shaping the startup landscape, with insights from 100+ founders and investors in our network.",
    category: "Insights",
    date: "2023-12-28",
    readTime: "8 min read",
  image: "/sustainable-biomaterials-packaging.png",
    author: "James Wilson",
    featured: true,
  },
]

const categories = ["All", "Funding", "Events", "Awards", "Programs", "Updates", "Insights"]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Funding":
      return <TrendingUp className="h-4 w-4" />
    case "Events":
      return <Calendar className="h-4 w-4" />
    case "Awards":
      return <Award className="h-4 w-4" />
    case "Programs":
      return <Users className="h-4 w-4" />
    case "Updates":
      return <Megaphone className="h-4 w-4" />
    case "Insights":
      return <ExternalLink className="h-4 w-4" />
    default:
      return <ExternalLink className="h-4 w-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Funding":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Events":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Awards":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Programs":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Updates":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "Insights":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

// Deterministic date formatting without relying on Date/locale (avoids SSR vs client timezone differences)
const formatDate = (dateStr: string) => {
  // Expect YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr; // fallback
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`; // DD/MM/YYYY fixed representation
};

export function NewsFeed() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredArticles = useMemo(() => {
    return newsArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const featuredArticles = filteredArticles.filter((article) => article.featured)
  const regularArticles = filteredArticles.filter((article) => !article.featured)

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filter News</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredArticles.length} of {newsArticles.length} articles
        </p>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Stories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      if (target.src.endsWith('placeholder.svg')) return
                      target.src = '/placeholder.svg'
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(article.category)}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(article.category)}
                        {article.category}
                      </div>
                    </Badge>
                    <span className="text-sm text-muted-foreground">{article.readTime}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {article.author}</span>
                    <span>{formatDate(article.date)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Articles */}
      {regularArticles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      if (target.src.endsWith('placeholder.svg')) return
                      target.src = '/placeholder.svg'
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className={getCategoryColor(article.category)}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(article.category)}
                        {article.category}
                      </div>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.readTime}</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>By {article.author}</span>
                    <span>{formatDate(article.date)}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Read More
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">No articles found matching your criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("All")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
