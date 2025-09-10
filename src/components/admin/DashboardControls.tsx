"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FaCog, FaDownload, FaEye, FaEyeSlash, FaChartLine, FaHistory } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

export interface DashboardSettings {
  showKPIs: boolean
  showRecentActivity: boolean
}

interface DashboardControlsProps {
  settings: DashboardSettings
  onSettingsChange: (settings: DashboardSettings) => void
  onExport: () => void
}

export default function DashboardControls({
  settings,
  onSettingsChange,
  onExport
}: DashboardControlsProps) {

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, key: keyof DashboardSettings) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSettingsChange({ ...settings, [key]: !settings[key] })
    }
  }

  const handleClick = () => onExport()

  const controls = [
    {
      key: 'showKPIs' as keyof DashboardSettings,
      label: 'Executive KPIs',
      icon: FaChartLine,
      description: 'Key performance indicators',
      color: 'blue'
    },
    {
      key: 'showRecentActivity' as keyof DashboardSettings,
      label: 'Recent Activity',
      icon: FaHistory,
      description: 'Latest system activities',
      color: 'violet'
    }
  ]

  return (
    <Card className="mb-6 admin-stat-card bg-card border-border" role="region" aria-labelledby="dashboard-controls-heading">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg" aria-hidden="true">
                <FaCog className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h2 id="dashboard-controls-heading" className="text-2xl font-bold">
                Dashboard Control
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4" role="group" aria-labelledby="dashboard-settings-group">
            <h3 id="dashboard-settings-group" className="sr-only">Dashboard Settings</h3>
            {controls.map(({ key, label, icon: Icon, description, color }) => (
              <div
                key={key}
                className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  settings[key]
                    ? `admin-stat-card--${color} admin-stat-card--active bg-card border-border`
                    : 'bg-card border-border'
                }`}
                onClick={() => onSettingsChange({ ...settings, [key]: !settings[key] })}
                onKeyDown={(e) => handleKeyDown(e, key)}
                role="button"
                tabIndex={0}
                aria-pressed={settings[key]}
                aria-label={`${settings[key] ? 'Hide' : 'Show'} ${label}: ${description}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg admin-stat-icon-container ${
                    settings[key] ? `bg-${color}-100 dark:bg-${color}-900/30` : ''
                  }`} aria-hidden="true">
                    <Icon className={`h-4 w-4 ${settings[key] ? '' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${settings[key] ? `text-${color}-700 dark:text-${color}-300` : 'text-card-foreground'}`}>
                        {label}
                      </span>
                      {settings[key] ? (
                        <FaEye className={`h-3 w-3 text-${color}-500`} aria-hidden="true" />
                      ) : (
                        <FaEyeSlash className="h-3 w-3 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </div>

                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-200 ${
                  settings[key]
                    ? color === 'blue'
                      ? 'bg-blue-600 shadow-lg'
                      : 'bg-purple-600 shadow-lg'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`} aria-hidden="true" />
              </div>
            ))}

            <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent mx-2" aria-hidden="true" role="separator" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="flex items-center gap-2 px-4 py-2 bg-card border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 hover:shadow-none hover:bg-card hover:text-card-foreground"
              aria-label="Export Dashboard Report"
            >
              <FaDownload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium text-card-foreground">Export</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}