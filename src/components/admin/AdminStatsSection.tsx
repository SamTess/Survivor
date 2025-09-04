"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt } from 'react-icons/fa'

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  color: string
  trend?: string
}

export default function AdminStatsSection() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Platform Statistics</h2>
        <p className="text-muted-foreground">Overview of key metrics and performance indicators</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  )
}
