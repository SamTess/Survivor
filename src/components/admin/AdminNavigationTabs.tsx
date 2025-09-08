"use client"

import React, { useState, useEffect } from 'react'
import { FaChartLine, FaCog, FaUsers, FaProjectDiagram, FaClock } from 'react-icons/fa'
import { Card } from '@/components/ui/card'

import AdminDashboardSection from './AdminDashboardSection'
import ProjectsCrudSection from './projects/ProjectsCrudSection'
import NewsCrudSection from './news/NewsCrudSection'
import EventsCrudSection from './events/EventsCrudSection'
import UsersCrudSection from './users/UsersCrudSection'

interface AdminTab {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
  description: string
}

export default function AdminNavigationTabs() {
  const ADMIN_TAB_KEY = 'survivor-admin-active-tab'

  const getStoredTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_TAB_KEY) || 'dashboard'
    }
    return 'dashboard'
  }

  const [activeTab, setActiveTab] = useState(getStoredTab)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_TAB_KEY, activeTab)
    }
  }, [activeTab])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const tabs: AdminTab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaChartLine size={16} />,
      component: <AdminDashboardSection />,
      description: 'Unified dashboard with statistics, analytics, and monitoring'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FaProjectDiagram size={16} />,
      component: <ProjectsCrudSection />,
      description: 'Manage startups and projects'
    },
    {
      id: 'news',
      label: 'News',
      icon: <FaCog size={16} />,
      component: <NewsCrudSection />,
      description: 'Manage articles and news'
    },
    {
      id: 'events',
      label: 'Events',
      icon: <FaClock size={16} />,
      component: <EventsCrudSection />,
      description: 'Manage events'
    },
    {
      id: 'users',
      label: 'Users',
      icon: <FaUsers size={16} />,
      component: <UsersCrudSection />,
      description: 'Manage users and permissions'
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" id="admin-area-title">
          <FaChartLine className="text-primary" size={32} aria-hidden="true" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete administrative control panel for managing projects, users, and platform analytics.
        </p>
      </header>

      <Card className="p-2">
        <nav aria-label="Admin navigation tabs" role="navigation">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title={tab.description}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </nav>
      </Card>

      {activeTabData && (
        <div
          className="bg-muted/20 rounded-lg p-4 border border-border/20"
          role="region"
          aria-labelledby="tab-description-title"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {activeTabData.icon}
            <span className="font-medium" id="tab-description-title">{activeTabData.label}</span>
            <span aria-hidden="true">•</span>
            <span>{activeTabData.description}</span>
          </div>
        </div>
      )}

      <main
        className="animate-fade-in-up"
        role="main"
        aria-labelledby={activeTabData ? `${activeTabData.id}-title` : undefined}
      >
        {activeTabData?.component}
      </main>
    </div>
  )
}
