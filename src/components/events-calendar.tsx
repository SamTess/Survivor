"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Presentation,
  GraduationCap,
  Coffee,
  Handshake,
  Video,
} from "lucide-react"

const events = [
  {
    id: 1,
    title: "Q1 2024 Demo Day",
    description:
      "Join us for our quarterly showcase where 12 selected startups will pitch to leading investors and industry experts.",
    type: "Pitch Session",
    date: "2024-03-15",
    time: "14:00",
    duration: "3 hours",
    location: "StartupHub Main Auditorium",
    isVirtual: false,
    capacity: 200,
    registered: 156,
    image: "/event-demo-day.png",
    featured: true,
  },
  {
    id: 2,
    title: "Women in Tech Networking Evening",
    description: "An evening of networking, mentorship, and inspiring conversations about building inclusive startups.",
    type: "Networking",
    date: "2024-02-20",
    time: "18:00",
    duration: "2 hours",
    location: "Innovation Center Lounge",
    isVirtual: false,
    capacity: 80,
    registered: 67,
    image: "/event-women-networking.png",
    featured: false,
  },
  {
    id: 3,
    title: "AI & Machine Learning Workshop",
    description:
      "Hands-on workshop covering the latest AI tools and techniques for startups. Bring your laptop and ideas!",
    type: "Workshop",
    date: "2024-02-28",
    time: "10:00",
    duration: "4 hours",
    location: "Tech Lab Room 3",
    isVirtual: false,
    capacity: 30,
    registered: 28,
    image: "/event-ai-workshop.png",
    featured: true,
  },
  {
    id: 4,
    title: "Fundraising 101: From Seed to Series A",
    description: "Learn the fundamentals of startup fundraising from successful founders and experienced investors.",
    type: "Workshop",
    date: "2024-03-05",
    time: "15:00",
    duration: "2 hours",
    location: "Virtual Event",
    isVirtual: true,
    capacity: 100,
    registered: 89,
    image: "/event-fundraising-workshop.png",
    featured: false,
  },
  {
    id: 5,
    title: "Monthly Founder Coffee Chat",
    description: "Casual coffee meetup for founders to share experiences, challenges, and celebrate wins together.",
    type: "Networking",
    date: "2024-02-25",
    time: "09:00",
    duration: "1.5 hours",
    location: "Café Connect",
    isVirtual: false,
    capacity: 25,
    registered: 18,
    image: "/event-coffee-chat.png",
    featured: false,
  },
  {
    id: 6,
    title: "TechCrunch Disrupt Viewing Party",
    description:
      "Join fellow entrepreneurs to watch TechCrunch Disrupt presentations and discuss the latest startup trends.",
    type: "Conference",
    date: "2024-04-10",
    time: "13:00",
    duration: "6 hours",
    location: "Main Conference Room",
    isVirtual: false,
    capacity: 50,
    registered: 32,
    image: "/event-viewing-party.png",
    featured: true,
  },
  {
    id: 7,
    title: "Legal Essentials for Startups",
    description:
      "Essential legal knowledge every founder needs: incorporation, contracts, IP protection, and compliance.",
    type: "Workshop",
    date: "2024-03-12",
    time: "16:00",
    duration: "2 hours",
    location: "Virtual Event",
    isVirtual: true,
    capacity: 75,
    registered: 45,
    image: "/event-legal-workshop.png",
    featured: false,
  },
  {
    id: 8,
    title: "Investor Speed Dating",
    description: "Fast-paced networking event where startups get 5-minute slots to pitch directly to investors.",
    type: "Pitch Session",
    date: "2024-03-20",
    time: "17:00",
    duration: "3 hours",
    location: "Networking Hall",
    isVirtual: false,
    capacity: 40,
    registered: 35,
    image: "/event-speed-dating.png",
    featured: true,
  },
]

const eventTypes = ["All", "Pitch Session", "Workshop", "Networking", "Conference"]

const getEventIcon = (type: string) => {
  switch (type) {
    case "Pitch Session":
      return <Presentation className="h-4 w-4" />
    case "Workshop":
      return <GraduationCap className="h-4 w-4" />
    case "Networking":
      return <Coffee className="h-4 w-4" />
    case "Conference":
      return <Handshake className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

const getEventColor = (type: string) => {
  switch (type) {
    case "Pitch Session":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Workshop":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Networking":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Conference":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export function EventsCalendar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [currentDate, setCurrentDate] = useState(new Date())

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "All" || event.type === selectedType

      return matchesSearch && matchesType
    })
  }, [searchTerm, selectedType])

  const upcomingEvents = filteredEvents
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const featuredEvents = upcomingEvents.filter((event) => event.featured)
  const regularEvents = upcomingEvents.filter((event) => !event.featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filter Events</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    {getEventIcon(type)}
                    {type}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-8">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Showing {upcomingEvents.length} upcoming events</p>
          </div>

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Featured Events</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {featuredEvents.map((event) => (
                  <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getEventColor(event.type)}>
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            {event.type}
                          </div>
                        </Badge>
                        {event.isVirtual && (
                          <Badge variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatTime(event.time)} ({event.duration})
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {event.registered}/{event.capacity} registered
                        </div>
                      </div>
                      <Button className="w-full">
                        {event.registered >= event.capacity ? "Join Waitlist" : "RSVP Now"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Events */}
          {regularEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className={getEventColor(event.type)}>
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            {event.type}
                          </div>
                        </Badge>
                        {event.isVirtual && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.time)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {event.registered}/{event.capacity}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        {event.registered >= event.capacity ? "Join Waitlist" : "RSVP"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {upcomingEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No upcoming events found</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("All")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>Interactive calendar view coming soon!</p>
              <p className="text-sm">For now, use the list view to browse all events.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
