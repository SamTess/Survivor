"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FaUsers } from 'react-icons/fa'

export default function AdminUserManagementSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
        <p className="text-muted-foreground">Role assignment (administrators, startups, privileged visitors)</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">12</div>
              <div className="text-sm text-muted-foreground">Administrators</div>
              <div className="w-full bg-red-100 h-2 rounded-full">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-sm text-muted-foreground">Startups</div>
              <div className="w-full bg-purple-100 h-2 rounded-full">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-muted-foreground">Privileged Visitors</div>
              <div className="w-full bg-blue-100 h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">990</div>
              <div className="text-sm text-muted-foreground">Regular Users</div>
              <div className="w-full bg-green-100 h-2 rounded-full">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User management tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUsers className="text-blue-600" />
            <h3 className="font-semibold">Recent Registrations</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Today</span>
              <span className="font-medium">23</span>
            </div>
            <div className="flex justify-between">
              <span>This week</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span>This month</span>
              <span className="font-medium">1,247</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUsers className="text-green-600" />
            <h3 className="font-semibold">Active Users</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Online now</span>
              <span className="font-medium text-green-600">87</span>
            </div>
            <div className="flex justify-between">
              <span>Daily active</span>
              <span className="font-medium">543</span>
            </div>
            <div className="flex justify-between">
              <span>Weekly active</span>
              <span className="font-medium">1,892</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUsers className="text-orange-600" />
            <h3 className="font-semibold">Role Changes</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Pending approvals</span>
              <span className="font-medium text-orange-600">8</span>
            </div>
            <div className="flex justify-between">
              <span>Role upgrades</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span>Access requests</span>
              <span className="font-medium">5</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
