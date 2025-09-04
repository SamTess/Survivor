"use client"

import React, { useState } from 'react'
import { FaChartLine, FaCog, FaUsers, FaProjectDiagram, FaClock, FaUserShield } from 'react-icons/fa'
import { Card } from '@/components/ui/card'

// Import des sections
import AdminStatsSection from './AdminStatsSection'
import AdminBackOfficeSection from './AdminBackOfficeSection'
import AdminDashboardSection from './AdminDashboardSection'
import AdminContentManagementSection from './AdminContentManagementSection'
import AdminUserManagementSection from './AdminUserManagementSection'
import AdminRecentActivitySection from './AdminRecentActivitySection'

interface AdminTab {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
  description: string
}

export default function AdminNavigationTabs() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs: AdminTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FaChartLine size={16} />,
      component: <AdminStatsSection />,
      description: 'Platform statistics and key metrics'
    },
    {
      id: 'backoffice',
      label: 'Back Office',
      icon: <FaCog size={16} />,
      component: <AdminBackOfficeSection />,
      description: 'Quick access to management tools'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaUserShield size={16} />,
      component: <AdminDashboardSection />,
      description: 'Analytics and system monitoring'
    },
    {
      id: 'content',
      label: 'Content',
      icon: <FaProjectDiagram size={16} />,
      component: <AdminContentManagementSection />,
      description: 'Manage projects, news and events'
    },
    {
      id: 'users',
      label: 'Users',
      icon: <FaUsers size={16} />,
      component: <AdminUserManagementSection />,
      description: 'User roles and permissions'
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <FaClock size={16} />,
      component: <AdminRecentActivitySection />,
      description: 'Recent administrative actions'
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FaUserShield className="text-primary" size={32} />
          Admin Area
        </h1>
        <p className="text-muted-foreground text-lg">
          Management of projects, startups, and users - Complete administrative control panel.
        </p>
      </div>

      {/* Navigation Tabs */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={tab.description}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Active Tab Description */}
      {activeTabData && (
        <div className="bg-muted/20 rounded-lg p-4 border border-border/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {activeTabData.icon}
            <span className="font-medium">{activeTabData.label}</span>
            <span>•</span>
            <span>{activeTabData.description}</span>
          </div>
        </div>
      )}

      {/* Active Tab Content */}
      <div className="animate-fade-in-up">
        {activeTabData?.component}
      </div>
    </div>
  )
}
