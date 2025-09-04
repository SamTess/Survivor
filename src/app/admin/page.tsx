"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaChartLine, FaUserShield, FaCog, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  color: string
  trend?: string
}

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  roles?: ('USER' | 'ADMIN' | 'MODERATOR')[]
}

export default function AdminDashboard() {
  const { hasRole } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const statsCards: StatCard[] = [
    {
      title: "Total Users",
      value: 1247,
      description: "+12% from last month",
      icon: <FaUsers className="text-blue-500" size={24} />,
      color: "bg-blue-50 border-blue-200",
      trend: "+12%"
    },
    {
      title: "Active Projects",
      value: 89,
      description: "Currently running",
      icon: <FaProjectDiagram className="text-green-500" size={24} />,
      color: "bg-green-50 border-green-200",
      trend: "+5%"
    },
    {
      title: "News Articles",
      value: 156,
      description: "Published this month",
      icon: <FaNewspaper className="text-purple-500" size={24} />,
      color: "bg-purple-50 border-purple-200",
      trend: "+8%"
    },
    {
      title: "Upcoming Events",
      value: 23,
      description: "Next 30 days",
      icon: <FaCalendarAlt className="text-orange-500" size={24} />,
      color: "bg-orange-50 border-orange-200",
      trend: "+15%"
    }
  ]

  const quickActions: QuickAction[] = [
    {
      title: "User Management",
      description: "Manage user accounts, roles and permissions",
      href: "/admin/users-management",
      icon: <FaUsers className="text-blue-600" size={20} />,
      color: "hover:bg-blue-50 border-blue-200",
      roles: ['ADMIN']
    },
    {
      title: "Project Management", 
      description: "Oversee projects and startup applications",
      href: "/admin/projects-management",
      icon: <FaProjectDiagram className="text-green-600" size={20} />,
      color: "hover:bg-green-50 border-green-200",
      roles: ['ADMIN']
    },
    {
      title: "News Management",
      description: "Create and edit news articles",
      href: "/admin/news-management", 
      icon: <FaNewspaper className="text-purple-600" size={20} />,
      color: "hover:bg-purple-50 border-purple-200",
      roles: ['ADMIN', 'MODERATOR']
    },
    {
      title: "Events Management",
      description: "Schedule and manage upcoming events",
      href: "/admin/events-management",
      icon: <FaCalendarAlt className="text-orange-600" size={20} />,
      color: "hover:bg-orange-50 border-orange-200", 
      roles: ['ADMIN', 'MODERATOR']
    }
  ]

  const filteredActions = quickActions.filter(action =>
    !action.roles || hasRole(action.roles)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen ml-14">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen ml-14 flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FaUserShield className="text-primary" size={32} />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back! Here&apos;s what&apos;s happening with your platform.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {statsCards.map((stat, index) => (
              <Card key={index} className={`${stat.color} transition-all duration-300 hover:shadow-lg hover:scale-105 animate-card`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                  {stat.trend && (
                    <div className="mt-2">
                      <span className="text-xs text-green-600 font-medium">
                        {stat.trend}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <FaCog className="text-primary" size={20} />
              <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className={`transition-all duration-300 hover:shadow-md cursor-pointer border-2 ${action.color} group`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-foreground">
                        <div className="flex items-center gap-3">
                          {action.icon}
                          {action.title}
                        </div>
                        <FaArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" size={16} />
                      </CardTitle>
                      <CardDescription>
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-primary" size={20} />
              <h2 className="text-xl font-semibold text-foreground">Platform Analytics</h2>
            </div>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">94.2%</div>
                    <div className="text-sm text-muted-foreground">System Uptime</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">2.3k</div>
                    <div className="text-sm text-muted-foreground">Monthly Active Users</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">1.8k</div>
                    <div className="text-sm text-muted-foreground">New Registrations</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last updated</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { action: "New user registered", user: "john.doe@example.com", time: "2 minutes ago", type: "user" },
                    { action: "Project submitted", user: "TechStart Inc.", time: "15 minutes ago", type: "project" },
                    { action: "News article published", user: "Editor Team", time: "1 hour ago", type: "news" },
                    { action: "Event created", user: "Event Manager", time: "2 hours ago", type: "event" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'user' ? 'bg-blue-500' :
                          activity.type === 'project' ? 'bg-green-500' :
                          activity.type === 'news' ? 'bg-purple-500' : 'bg-orange-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-foreground">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">{activity.user}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}
