"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt } from 'react-icons/fa'

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  colorClasses: string
  trend?: string
}

export default function AdminStatsSection() {
  const statsCards: StatCard[] = [
    {
      title: "Total Users",
      value: 1247,
      description: "+12% from last month",
      icon: <FaUsers className="text-white" size={24} />,
      colorClasses: "bg-gradient-to-br from-blue-600 to-blue-700 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-300 dark:border-blue-500 hover:from-blue-500 hover:to-blue-600 dark:hover:from-slate-700 dark:hover:to-slate-800 hover:shadow-xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/20 transition-all duration-300 hover:-translate-y-1",
      trend: "+12%"
    },
    {
      title: "Active Projects",
      value: 89,
      description: "Currently running",
      icon: <FaProjectDiagram className="text-white" size={24} />,
      colorClasses: "bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-slate-800 dark:to-slate-900 border-2 border-emerald-300 dark:border-emerald-500 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-slate-700 dark:hover:to-slate-800 hover:shadow-xl hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/20 transition-all duration-300 hover:-translate-y-1",
      trend: "+5%"
    },
    {
      title: "News Articles",
      value: 156,
      description: "Published this month",
      icon: <FaNewspaper className="text-white" size={24} />,
      colorClasses: "bg-gradient-to-br from-purple-600 to-purple-700 dark:from-slate-800 dark:to-slate-900 border-2 border-purple-300 dark:border-purple-500 hover:from-purple-500 hover:to-purple-600 dark:hover:from-slate-700 dark:hover:to-slate-800 hover:shadow-xl hover:shadow-purple-500/25 dark:hover:shadow-purple-400/20 transition-all duration-300 hover:-translate-y-1",
      trend: "+8%"
    },
    {
      title: "Upcoming Events",
      value: 23,
      description: "Next 30 days",
      icon: <FaCalendarAlt className="text-white" size={24} />,
      colorClasses: "bg-gradient-to-br from-amber-600 to-orange-600 dark:from-slate-800 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-500 hover:from-amber-500 hover:to-orange-500 dark:hover:from-slate-700 dark:hover:to-slate-800 hover:shadow-xl hover:shadow-amber-500/25 dark:hover:shadow-amber-400/20 transition-all duration-300 hover:-translate-y-1",
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
          <Card 
            key={index} 
            className={`${stat.colorClasses} transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border-2 backdrop-blur-sm relative overflow-hidden group`}
          >
            {/* Gradient overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-white">
                {stat.title}
              </CardTitle>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md shadow-lg border border-white/30">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <p className="text-sm text-white/80 mb-3">
                {stat.description}
              </p>
              {stat.trend && (
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
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