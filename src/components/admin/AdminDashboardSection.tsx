"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FaChartLine } from 'react-icons/fa'

export default function AdminDashboardSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Statistics on project visibility and user interactions</p>
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

      {/* Additional analytics charts could go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-primary" />
            <h3 className="font-semibold">Project Views</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Chart visualization would go here
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-primary" />
            <h3 className="font-semibold">User Engagement</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Chart visualization would go here
          </div>
        </Card>
      </div>
    </div>
  )
}
