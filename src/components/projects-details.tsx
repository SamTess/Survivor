import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Calendar,
  Users,
  Globe,
  Mail,
  Linkedin,
  CheckCircle,
  Clock,
  Circle,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react"

interface Founder {
  name: string
  role: string
  bio: string
  linkedin: string
  image: string
}

interface Milestone {
  date: string
  title: string
  status: "completed" | "in-progress" | "upcoming"
}

interface Project {
  id: number
  name: string
  tagline: string
  description: string
  sector: string
  stage: string
  location: string
  founded: string
  funding: string
  teamSize: number
  website: string
  email: string
  image: string
  founders: Founder[]
  milestones: Milestone[]
  fundingNeeds: {
    amount: string
    purpose: string
    timeline: string
  }
  socialMedia: {
    twitter: string
    linkedin: string
  }
  metrics: {
    revenue: string
    customers: string
    growth: string
  }
}

interface ProjectDetailsProps {
  project: Project
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const completedMilestones = project.milestones.filter((m) => m.status === "completed").length
  const progressPercentage = (completedMilestones / project.milestones.length) * 100

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="text-sm">
                {project.sector}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {project.stage}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{project.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">{project.tagline}</p>
            <p className="text-foreground leading-relaxed mb-6">{project.description}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Mail className="mr-2 h-4 w-4" />
                Contact Team
              </Button>
              <Button variant="outline" size="lg">
                <Globe className="mr-2 h-4 w-4" />
                Visit Website
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {project.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Founded {project.founded}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {project.teamSize} team members
              </div>
            </div>
          </div>

          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img src={project.image || "/placeholder.svg"} alt={project.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Founders */}
            <Card>
              <CardHeader>
                <CardTitle>Meet the Founders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.founders.map((founder, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={founder.image || "/placeholder.svg?height=64&width=64"}
                          alt={founder.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{founder.name}</h4>
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-primary font-medium mb-2">{founder.role}</p>
                        <p className="text-sm text-muted-foreground">{founder.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress & Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Progress & Milestones</CardTitle>
                <CardDescription>Track our journey and upcoming goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedMilestones}/{project.milestones.length} completed
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {milestone.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {milestone.status === "in-progress" && <Clock className="h-5 w-5 text-yellow-500" />}
                      {milestone.status === "upcoming" && <Circle className="h-5 w-5 text-muted-foreground" />}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-foreground">{project.metrics.revenue}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="font-semibold text-foreground">{project.metrics.customers}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Growth</p>
                  <p className="font-semibold text-foreground">{project.metrics.growth}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Total Funding</p>
                  <p className="font-semibold text-foreground">{project.funding}</p>
                </div>
              </CardContent>
            </Card>

            {/* Funding Needs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Funding Needs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Seeking</p>
                  <p className="text-2xl font-bold text-primary">{project.fundingNeeds.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                  <p className="font-semibold text-foreground">{project.fundingNeeds.timeline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="text-sm text-foreground">{project.fundingNeeds.purpose}</p>
                </div>
                <Button className="w-full mt-4">
                  <Target className="mr-2 h-4 w-4" />
                  Express Interest
                </Button>
              </CardContent>
            </Card>

            {/* Contact & Social */}
            <Card>
              <CardHeader>
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  {project.email}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
