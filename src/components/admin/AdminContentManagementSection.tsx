"use client"

import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaProjectDiagram, FaNewspaper, FaCalendarAlt } from 'react-icons/fa'

export default function AdminContentManagementSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Content Management</h2>
        <p className="text-muted-foreground">Adding, editing, and deleting project profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="transition-all duration-300 hover:shadow-md border-2 border-green-200 hover:bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <FaProjectDiagram size={18} />
              Project Profiles
            </CardTitle>
            <CardDescription>
              Create, edit and manage startup project profiles with detailed information and media
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md border-2 border-blue-200 hover:bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FaNewspaper size={18} />
              News & Articles
            </CardTitle>
            <CardDescription>
              Publish and manage news articles, announcements and editorial content
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md border-2 border-orange-200 hover:bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <FaCalendarAlt size={18} />
              Events & Meetings
            </CardTitle>
            <CardDescription>
              Schedule events, workshops and networking opportunities for the community
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Content management tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Content Actions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Projects created this week</span>
              <span className="font-medium text-green-600">12</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Articles published</span>
              <span className="font-medium text-blue-600">8</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Events scheduled</span>
              <span className="font-medium text-orange-600">3</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Content Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Pending approval</span>
              <span className="font-medium text-yellow-600">5</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Draft content</span>
              <span className="font-medium text-gray-600">15</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Published content</span>
              <span className="font-medium text-green-600">142</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
