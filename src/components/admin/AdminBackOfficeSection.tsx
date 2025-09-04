"use client"

import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaUsers, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  roles?: ('ADMIN' | 'MODERATOR')[]
}

export default function AdminBackOfficeSection() {
  const { hasRole } = useAuth()
  
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Admin Back Office</h2>
        <p className="text-muted-foreground">Management of projects, startups, and users</p>
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
  )
}
