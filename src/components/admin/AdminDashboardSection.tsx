"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FaUsers,
  FaProjectDiagram,
  FaNewspaper,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaFire,
  FaRocket,
  FaLightbulb,
  FaBolt,
  FaCog,
  FaDownload
} from 'react-icons/fa'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useStatsDetails } from '@/hooks/useStatsDetails'
import { useRecentActivity, ActivityItem } from '@/hooks/useRecentActivity'

// Types pour le dashboard
interface DashboardSettings {
  showKPIs: boolean
  showSystemHealth: boolean
  showRecentActivity: boolean
  showInsights: boolean
  showPerformanceMetrics: boolean
}

interface StatsData {
  totalUsers?: { value: number; trend: string; description: string }
  activeProjects?: { value: number; trend: string; description: string }
  newsArticles?: { value: number; trend: string; description: string }
  upcomingEvents?: { value: number; trend: string; description: string }
}

interface DetailsData {
  userGrowthChart?: { month: string; users: number; growth: number }[]
  projectsDistribution?: { status: string; count: number; percentage: number }[]
  newsPerformance?: { title: string; views: number; engagement: number }[]
}

// Composant moderne pour le contrôle de visibilité des sections
const DashboardControls = ({
  settings,
  onSettingsChange,
  onExport
}: {
  settings: DashboardSettings
  onSettingsChange: (settings: DashboardSettings) => void
  onExport: () => void
}) => (
  <Card className="mb-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 border-slate-200 dark:border-slate-700">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Titre élégant */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FaCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard & Overview
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Toggle sections to customize your view
            </p>
          </div>
        </div>

        {/* Contrôles modernes avec toggles */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Toggle KPIs */}
          <div className="flex items-center gap-3">
            <label htmlFor="toggle-kpis" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Executive KPIs
            </label>
            <button
              id="toggle-kpis"
              role="switch"
              aria-checked={settings.showKPIs}
              aria-label={`${settings.showKPIs ? 'Hide' : 'Show'} Executive KPIs section`}
              onClick={() => onSettingsChange({...settings, showKPIs: !settings.showKPIs})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                settings.showKPIs ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showKPIs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle System Health */}
          <div className="flex items-center gap-3">
            <label htmlFor="toggle-system" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              System Health
            </label>
            <button
              id="toggle-system"
              role="switch"
              aria-checked={settings.showSystemHealth}
              aria-label={`${settings.showSystemHealth ? 'Hide' : 'Show'} System Health monitoring`}
              onClick={() => onSettingsChange({...settings, showSystemHealth: !settings.showSystemHealth})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                settings.showSystemHealth ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showSystemHealth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle Activity */}
          <div className="flex items-center gap-3">
            <label htmlFor="toggle-activity" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Recent Activity
            </label>
            <button
              id="toggle-activity"
              role="switch"
              aria-checked={settings.showRecentActivity}
              aria-label={`${settings.showRecentActivity ? 'Hide' : 'Show'} Recent Activity feed`}
              onClick={() => onSettingsChange({...settings, showRecentActivity: !settings.showRecentActivity})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                settings.showRecentActivity ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showRecentActivity ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle Insights */}
          <div className="flex items-center gap-3">
            <label htmlFor="toggle-insights" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              AI Insights
            </label>
            <button
              id="toggle-insights"
              role="switch"
              aria-checked={settings.showInsights}
              aria-label={`${settings.showInsights ? 'Hide' : 'Show'} AI Insights panel`}
              onClick={() => onSettingsChange({...settings, showInsights: !settings.showInsights})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                settings.showInsights ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showInsights ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle Performance Metrics */}
          <div className="flex items-center gap-3">
            <label htmlFor="toggle-metrics" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Performance Analytics
            </label>
            <button
              id="toggle-metrics"
              role="switch"
              aria-checked={settings.showPerformanceMetrics}
              aria-label={`${settings.showPerformanceMetrics ? 'Hide' : 'Show'} Performance Analytics charts`}
              onClick={() => onSettingsChange({...settings, showPerformanceMetrics: !settings.showPerformanceMetrics})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                settings.showPerformanceMetrics ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showPerformanceMetrics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
            aria-label="Export Dashboard Report"
          >
            <FaDownload className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Composant KPI Executive simplifié et accessible
const ExecutiveKPIs = ({ stats }: { stats: StatsData | null }) => (
  <section aria-labelledby="kpi-heading">
    <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="group hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FaUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground" aria-label={`${stats?.totalUsers?.value?.toLocaleString() || '0'} total users`}>
                  {stats?.totalUsers?.value?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            {stats?.totalUsers?.trend && (
              <Badge
                variant={stats.totalUsers.trend.startsWith('+') ? 'default' : 'secondary'}
                aria-label={`Trend: ${stats.totalUsers.trend}`}
              >
                {stats.totalUsers.trend.startsWith('+') ?
                  <FaArrowUp className="h-3 w-3 mr-1" aria-hidden="true" /> :
                  <FaArrowDown className="h-3 w-3 mr-1" aria-hidden="true" />
                }
                {stats.totalUsers.trend}
              </Badge>
            )}
          </div>
          {stats?.totalUsers?.description && (
            <p className="text-xs text-muted-foreground mt-2" id="users-description">
              {stats.totalUsers.description}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="group hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <FaProjectDiagram className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground" aria-label={`${stats?.activeProjects?.value?.toLocaleString() || '0'} active projects`}>
                  {stats?.activeProjects?.value?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            {stats?.activeProjects?.trend && (
              <Badge
                variant={stats.activeProjects.trend.startsWith('+') ? 'default' : 'secondary'}
                aria-label={`Trend: ${stats.activeProjects.trend}`}
              >
                {stats.activeProjects.trend.startsWith('+') ?
                  <FaArrowUp className="h-3 w-3 mr-1" aria-hidden="true" /> :
                  <FaArrowDown className="h-3 w-3 mr-1" aria-hidden="true" />
                }
                {stats.activeProjects.trend}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FaNewspaper className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">News Articles</p>
                <p className="text-2xl font-bold text-foreground" aria-label={`${stats?.newsArticles?.value?.toLocaleString() || '0'} news articles`}>
                  {stats?.newsArticles?.value?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            {stats?.newsArticles?.trend && (
              <Badge
                variant={stats.newsArticles.trend.startsWith('+') ? 'default' : 'secondary'}
                aria-label={`Trend: ${stats.newsArticles.trend}`}
              >
                {stats.newsArticles.trend.startsWith('+') ?
                  <FaArrowUp className="h-3 w-3 mr-1" aria-hidden="true" /> :
                  <FaArrowDown className="h-3 w-3 mr-1" aria-hidden="true" />
                }
                {stats.newsArticles.trend}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <FaCalendarAlt className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold text-foreground" aria-label={`${stats?.upcomingEvents?.value?.toLocaleString() || '0'} upcoming events`}>
                  {stats?.upcomingEvents?.value?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            {stats?.upcomingEvents?.trend && (
              <Badge
                variant={stats.upcomingEvents.trend.startsWith('+') ? 'default' : 'secondary'}
                aria-label={`Trend: ${stats.upcomingEvents.trend}`}
              >
                {stats.upcomingEvents.trend.startsWith('+') ?
                  <FaArrowUp className="h-3 w-3 mr-1" aria-hidden="true" /> :
                  <FaArrowDown className="h-3 w-3 mr-1" aria-hidden="true" />
                }
                {stats.upcomingEvents.trend}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
)

// Composant System Health simplifié
const SystemHealthOverview = () => (
  <section aria-labelledby="system-health-heading">
    <Card className="mb-8">
      <CardHeader>
        <CardTitle id="system-health-heading" className="text-lg font-semibold flex items-center gap-2">
          <FaBolt className="h-5 w-5 text-green-500" aria-hidden="true" />
          System Health Overview
          <div className="ml-auto flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <span className="text-sm text-green-600 dark:text-green-400">Online</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold text-green-600" aria-label="System uptime 99.9%">99.9%</div>
            <div className="text-sm text-muted-foreground">System Uptime</div>
            <Progress value={99.9} className="h-3" aria-label="Uptime progress bar" />
          </div>
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold text-blue-600" aria-label="Average response time 42 milliseconds">42ms</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
            <Progress value={85} className="h-3" aria-label="Response time performance" />
          </div>
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold text-purple-600" aria-label="Database size 2.1 gigabytes">2.1GB</div>
            <div className="text-sm text-muted-foreground">Database Size</div>
            <Progress value={67} className="h-3" aria-label="Database usage" />
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
)

// Composant Recent Activity Feed simplifié
const RecentActivityFeed = ({ activities }: { activities: ActivityItem[] }) => (
  <section aria-labelledby="recent-activity-heading">
    <Card className="mb-8">
      <CardHeader>
        <CardTitle id="recent-activity-heading" className="text-lg font-semibold flex items-center gap-2">
          <FaClock className="h-5 w-5 text-blue-500" aria-hidden="true" />
          Recent Platform Activity
          <Badge variant="secondary" className="ml-auto">Last 24h</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto" role="log" aria-live="polite">
          {activities.slice(0, 8).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                activity.type === 'project' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                activity.type === 'news' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {activity.type === 'user' && <FaUsers className="h-4 w-4" aria-hidden="true" />}
                {activity.type === 'project' && <FaProjectDiagram className="h-4 w-4" aria-hidden="true" />}
                {activity.type === 'news' && <FaNewspaper className="h-4 w-4" aria-hidden="true" />}
                {activity.type === 'event' && <FaCalendarAlt className="h-4 w-4" aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{activity.action}</h4>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <time className="text-xs text-muted-foreground" dateTime={activity.timestamp}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </time>
                  <Badge
                    variant={
                      activity.severity === 'high' ? 'destructive' :
                      activity.severity === 'medium' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {activity.severity}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </section>
)

// Composant Strategic Insights
const StrategicInsights = ({ stats, details }: { stats: StatsData | null, details: DetailsData | null }) => {
  const getExecutiveInsights = () => {
    const insights = []

    if (stats?.totalUsers?.trend?.startsWith('+')) {
      insights.push({
        icon: FaRocket,
        title: "Strong User Acquisition",
        description: `Platform experiencing ${stats.totalUsers.trend} user growth. Consider scaling infrastructure.`,
        priority: "high"
      })
    }

    if (details?.projectsDistribution && details.projectsDistribution.length > 0) {
      const activeProjects = details.projectsDistribution.find(p => p.status === 'active')
      if (activeProjects && activeProjects.percentage > 60) {
        insights.push({
          icon: FaFire,
          title: "High Ecosystem Velocity",
          description: `${activeProjects.percentage}% project activity rate indicates healthy startup pipeline.`,
          priority: "medium"
        })
      }
    }

    insights.push({
      icon: FaLightbulb,
      title: "Strategic Recommendation",
      description: "Consider implementing mentorship matching system to boost startup success rates.",
      priority: "low"
    })

    return insights
  }

  const insights = getExecutiveInsights()

  return (
    <section aria-labelledby="insights-heading">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle id="insights-heading" className="text-lg font-semibold flex items-center gap-2">
            <FaLightbulb className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            Strategic Insights
            <Badge variant="outline" className="ml-auto">AI Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high' ? 'bg-red-50 border-red-500 dark:bg-red-900/10' :
                  insight.priority === 'medium' ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/10' :
                  'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/10'
                }`}
                role="article"
                aria-labelledby={`insight-${index}-title`}
              >
                <div className="flex items-start space-x-3">
                  <insight.icon
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      insight.priority === 'high' ? 'text-red-600' :
                      insight.priority === 'medium' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h4 id={`insight-${index}-title`} className="font-semibold text-sm">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

// Section Performance Analytics avec graphiques et métriques détaillées
const PerformanceAnalytics = ({ 
  stats
}: { 
  stats: StatsData | null
}) => (
  <section aria-labelledby="performance-heading">
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3" id="performance-heading">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-800">
            <FaRocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Performance Analytics</h2>
            <p className="text-sm text-muted-foreground">Growth trends and operational metrics</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Growth Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Growth Trend */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">User Growth</h3>
                <Badge variant="secondary" className="text-xs">+{((stats?.totalUsers?.value || 100) * 0.15).toFixed(0)}%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium">+{((stats?.totalUsers?.value || 100) * 0.08).toFixed(0)} users</span>
                </div>
                <Progress 
                  value={75} 
                  className="h-2" 
                  aria-label="User growth progress"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {((stats?.totalUsers?.value || 100) * 1.2).toFixed(0)}</span>
                  <span>75% complete</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Success Rate */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Project Success</h3>
                <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {((stats?.activeProjects?.value || 50) / ((stats?.activeProjects?.value || 50) + 10) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{stats?.activeProjects?.value || 42} projects</span>
                </div>
                <Progress 
                  value={85} 
                  className="h-2" 
                  aria-label="Project success rate"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Failed: {Math.floor((stats?.activeProjects?.value || 50) * 0.1)}</span>
                  <span>85% success</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Engagement */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Content Engagement</h3>
                <Badge variant="outline" className="text-xs">+{((stats?.newsArticles?.value || 30) * 2.5).toFixed(0)}% views</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Views</span>
                  <span className="font-medium">{((stats?.newsArticles?.value || 30) * 125).toFixed(0)}</span>
                </div>
                <Progress 
                  value={68} 
                  className="h-2" 
                  aria-label="Content engagement progress"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {((stats?.newsArticles?.value || 30) * 200).toFixed(0)}</span>
                  <span>68% of goal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Visualization */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FaBolt className="h-4 w-4 text-orange-500" />
              Monthly Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "New Users", value: "+245", trend: "up", color: "blue" },
                { label: "Active Projects", value: "+12", trend: "up", color: "green" },
                { label: "Content Views", value: "+1.2k", trend: "up", color: "purple" },
                { label: "Success Rate", value: "+5.2%", trend: "up", color: "orange" }
              ].map((metric, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                  <p className={`text-lg font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>
                    {metric.value}
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <FaArrowUp className={`h-3 w-3 text-${metric.color}-500 mr-1`} />
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Simple Chart Representation */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Growth Pattern (Last 6 Months)</h4>
              <div className="flex items-end justify-between h-32 bg-gradient-to-t from-slate-100 to-transparent dark:from-slate-700 rounded-lg p-4">
                {[40, 55, 65, 45, 70, 85].map((height, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-500"
                    style={{ height: `${height}%`, width: '12%' }}
                    title={`Month ${index + 1}: ${height}% growth`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FaFire className="h-4 w-4 text-red-500" />
                Top Performing Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { metric: "User Retention Rate", value: "94.2%", change: "+2.1%" },
                { metric: "Project Completion", value: "87.5%", change: "+5.3%" },
                { metric: "Content Engagement", value: "73.8%", change: "+8.7%" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/70">
                  <div>
                    <p className="font-medium text-sm">{item.metric}</p>
                    <p className="text-xs text-muted-foreground">Current performance</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.value}</p>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <FaArrowUp className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">{item.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FaBolt className="h-4 w-4 text-yellow-500" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-green-100 dark:bg-green-900">
                    <FaArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Exceptional Growth</p>
                    <p className="text-xs text-muted-foreground">User acquisition up 245% this month</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-100 dark:bg-blue-900">
                    <FaRocket className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Project Velocity</p>
                    <p className="text-xs text-muted-foreground">Completion rate improving consistently</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-purple-100 dark:bg-purple-900">
                    <FaLightbulb className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Content Strategy</p>
                    <p className="text-xs text-muted-foreground">Engagement metrics show strong user interest</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  </section>
)

export default function AdminDashboardSection() {
  const { stats, loading: statsLoading } = useAdminStats()
  const { data: details, loading: detailsLoading } = useStatsDetails()
  const { data: activityData, loading: activityLoading } = useRecentActivity()

  const [settings, setSettings] = useState<DashboardSettings>({
    showKPIs: true,
    showSystemHealth: true,
    showRecentActivity: true,
    showInsights: true,
    showPerformanceMetrics: true // Désactivé par défaut pour éviter la redondance avec Overview
  })

  const [timeOfDay, setTimeOfDay] = useState('')

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour < 12) setTimeOfDay('Good morning')
      else if (hour < 17) setTimeOfDay('Good afternoon')
      else setTimeOfDay('Good evening')
    }
    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleExport = () => {
    // Fonction d'export simple
    const reportData = {
      generated: new Date().toISOString(),
      stats,
      systemHealth: { uptime: '99.9%', responseTime: '42ms', dbSize: '2.1GB' },
      recentActivities: activityData?.activities?.slice(0, 10)
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (statsLoading || detailsLoading || activityLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <span className="sr-only">Loading dashboard content...</span>
      </div>
    )
  }

  return (
    <main className="space-y-6" role="main" aria-labelledby="dashboard-title">
      {/* Header accessible */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 id="dashboard-title" className="text-3xl font-bold text-foreground mb-2">
            {timeOfDay}, Admin! 👋
          </h1>
          <p className="text-muted-foreground" id="dashboard-subtitle">
            Executive dashboard with customizable views and accessibility features
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
      </header>

      {/* Contrôles de dashboard */}
      <DashboardControls
        settings={settings}
        onSettingsChange={setSettings}
        onExport={handleExport}
      />

      {/* Sections conditionnelles basées sur les paramètres */}
      {settings.showKPIs && (
        <ExecutiveKPIs stats={stats} />
      )}

      {settings.showSystemHealth && (
        <SystemHealthOverview />
      )}

      {settings.showRecentActivity && (
        <RecentActivityFeed activities={activityData?.activities || []} />
      )}

      {settings.showInsights && (
        <StrategicInsights stats={stats} details={details} />
      )}

      {settings.showPerformanceMetrics && (
        <PerformanceAnalytics stats={stats} />
      )}

      {/* Note pour l'utilisateur sur la différence avec Overview */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FaLightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                Unified Dashboard & Overview
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                This unified interface combines both Dashboard and Overview functionality. Use the toggle controls above to customize your view with Executive KPIs, System Health, Recent Activity, AI Insights, and Performance Analytics all in one place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
