"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminRecentActivitySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Recent Administrative Activity</h2>
        <p className="text-muted-foreground">Latest actions and changes in the system</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { action: "New startup registered", user: "TechStart Inc.", time: "2 minutes ago", type: "project" },
              { action: "User role updated to Admin", user: "john.doe@example.com", time: "15 minutes ago", type: "user" },
              { action: "News article published", user: "Editor Team", time: "1 hour ago", type: "news" },
              { action: "Event created: Startup Pitch Day", user: "Event Manager", time: "2 hours ago", type: "event" },
              { action: "Project profile approved", user: "GreenTech Solutions", time: "3 hours ago", type: "project" },
              { action: "User account suspended", user: "spam.user@example.com", time: "4 hours ago", type: "user" },
              { action: "News article edited", user: "Content Team", time: "6 hours ago", type: "news" },
              { action: "Event cancelled: Workshop", user: "Event Manager", time: "8 hours ago", type: "event" }
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

      {/* Activity summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-lg font-bold text-blue-600">24</div>
          <div className="text-sm text-muted-foreground">User Actions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-lg font-bold text-green-600">18</div>
          <div className="text-sm text-muted-foreground">Project Changes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-lg font-bold text-purple-600">12</div>
          <div className="text-sm text-muted-foreground">Content Updates</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-lg font-bold text-orange-600">8</div>
          <div className="text-sm text-muted-foreground">Events Modified</div>
        </Card>
      </div>
    </div>
  )
}
