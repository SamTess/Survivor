"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FormModal } from '@/components/modals/ModalVariants'
import { UniversalModal } from '@/components/modals/UniversalModal'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  MapPin,
  Users,
  Clock
} from 'lucide-react'

interface Event {
  id: number
  name: string
  description?: string
  image_data?: Uint8Array | null
  dates?: string
  location?: string
  event_type?: string
  target_audience?: string
  created_at: string
  viewsCount: number
  likesCount: number
  bookmarksCount: number
  sharesCount: number
  attendeesCount: number
}

interface EventFormData {
  name: string
  description: string
  dates: string
  location: string
  event_type: string
  target_audience: string
}

const EVENT_TYPES = [
  'Conference', 'Workshop', 'Networking', 'Pitch Event', 'Demo Day', 'Webinar', 'Meetup', 'Competition', 'Other'
]

const TARGET_AUDIENCES = [
  'Entrepreneurs', 'Investors', 'Developers', 'Students', 'General Public', 'Industry Professionals', 'Startups', 'All'
]

export default function AdminEventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedAudience, setSelectedAudience] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    dates: '',
    location: '',
    event_type: '',
    target_audience: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedType) {
      filtered = filtered.filter(event => event.event_type === selectedType)
    }

    if (selectedAudience) {
      filtered = filtered.filter(event => event.target_audience === selectedAudience)
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, selectedType, selectedAudience])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      const data = await response.json()

      if (data.success) {
        setEvents(data.data)
      } else {
        console.error('Error fetching events:', data.error)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setFormData({
      name: '',
      description: '',
      dates: '',
      location: '',
      event_type: '',
      target_audience: ''
    })
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description || '',
      dates: event.dates ? new Date(event.dates).toISOString().slice(0, 16) : '',
      location: event.location || '',
      event_type: event.event_type || '',
      target_audience: event.target_audience || ''
    })
    setIsModalOpen(true)
  }

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event)
    setIsViewModalOpen(true)
  }

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvents(events.filter(e => e.id !== id))
        toast.success('Event deleted successfully!')
      } else {
        toast.error('Deletion error', {
          description: 'Unable to delete this event'
        })
      }
    } catch {
      toast.error('Deletion error', {
        description: 'A network error occurred'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const submitData = {
        ...formData,
        dates: formData.dates ? new Date(formData.dates).toISOString() : null
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        await fetchEvents() // reload list
        setIsModalOpen(false)
        toast.success(`Event ${editingEvent ? 'updated' : 'created'} successfully!`, {
          description: `The event "${formData.name}" has been ${editingEvent ? 'updated' : 'scheduled'}`
        })
      } else {
        toast.error(`Error ${editingEvent ? 'updating' : 'creating'} event`, {
          description: data.error
        })
      }
    } catch {
      toast.error(`Error ${editingEvent ? 'updating' : 'creating'} event`, {
        description: 'A network error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeColor = (type?: string) => {
    const colors = {
      'Conference': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Workshop': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Networking': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Pitch Event': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Demo Day': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Webinar': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Meetup': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Competition': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
    return colors[type as keyof typeof colors] || colors['Other']
  }

  const isEventUpcoming = (dateString?: string) => {
    if (!dateString) return false
    return new Date(dateString) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading events...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header  */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Events Management</h2>
          <p className="text-muted-foreground">Organize and manage your ecosystem events</p>
        </div>
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus size={16} />
          New Event
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by name, description or location..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All types</option>
              {EVENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
            >
              <option value="">All audiences</option>
              {TARGET_AUDIENCES.map(audience => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Events ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Location</th>
                    <th className="text-left py-3 px-2">Audience</th>
                    <th className="text-left py-3 px-2">Participants</th>
                    <th className="text-left py-3 px-2">Views</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {event.name}
                              {isEventUpcoming(event.dates) && (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded dark:bg-green-900 dark:text-green-200">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {event.event_type && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="text-sm">
                            {event.dates ? formatDate(event.dates) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-muted-foreground" />
                          <span className="text-sm">{event.location || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-muted-foreground" />
                          <span className="text-sm">{event.target_audience || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">{event.attendeesCount}</td>
                      <td className="py-3 px-2">{event.viewsCount}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewEvent(event)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingEvent ? 'Edit Event' : 'New Event'}
        loading={isSubmitting}
        submitLabel={editingEvent ? 'Update' : 'Create'}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="event-name" className="block text-sm font-medium mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              id="event-name"
              type="text"
              required
              autoComplete="off"
              placeholder="Enter event name"
              aria-describedby="event-name-help"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div id="event-name-help" className="text-xs text-muted-foreground mt-1">
              Enter a descriptive name for the event
            </div>
          </div>

          <div>
            <label htmlFor="event-description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="event-description"
              rows={4}
              autoComplete="off"
              placeholder="Describe the event, its purpose, and what attendees can expect"
              aria-describedby="event-description-help"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div id="event-description-help" className="text-xs text-muted-foreground mt-1">
              Provide details about the event agenda, speakers, and objectives
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-dates" className="block text-sm font-medium mb-1">Date and Time</label>
              <input
                id="event-dates"
                type="datetime-local"
                autoComplete="off"
                placeholder="Select date and time"
                aria-describedby="event-dates-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={formData.dates}
                onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
              />
              <div id="event-dates-help" className="text-xs text-muted-foreground mt-1">
                Choose the start date and time of the event
              </div>
            </div>

            <div>
              <label htmlFor="event-location" className="block text-sm font-medium mb-1">Location</label>
              <input
                id="event-location"
                type="text"
                autoComplete="address-line1"
                placeholder="Venue name and address"
                aria-describedby="event-location-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <div id="event-location-help" className="text-xs text-muted-foreground mt-1">
                Enter the venue name and complete address
              </div>
            </div>

            <div>
              <label htmlFor="event-type" className="block text-sm font-medium mb-1">Event Type</label>
              <select
                id="event-type"
                autoComplete="off"
                aria-describedby="event-type-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              >
                <option value="">Select a type</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div id="event-type-help" className="text-xs text-muted-foreground mt-1">
                Choose the category that best describes this event
              </div>
            </div>

            <div>
              <label htmlFor="event-audience" className="block text-sm font-medium mb-1">Target Audience</label>
              <select
                id="event-audience"
                autoComplete="off"
                aria-describedby="event-audience-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              >
                <option value="">Select an audience</option>
                {TARGET_AUDIENCES.map(audience => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>
              <div id="event-audience-help" className="text-xs text-muted-foreground mt-1">
                Select the primary audience for this event
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      {/* View Modal */}
      {viewingEvent && (
        <UniversalModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Event Details"
          size="auto"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <p className="text-sm font-medium">{viewingEvent.name}</p>
              </div>
              {viewingEvent.event_type && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Event Type</label>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {viewingEvent.event_type}
                  </span>
                </div>
              )}
              {viewingEvent.target_audience && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Target Audience</label>
                  <p className="text-sm">{viewingEvent.target_audience}</p>
                </div>
              )}
              {viewingEvent.dates && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</label>
                  <p className="text-sm">{new Date(viewingEvent.dates).toLocaleDateString('en-US')}</p>
                </div>
              )}
              {viewingEvent.location && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</label>
                  <p className="text-sm">{viewingEvent.location}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
                <p className="text-sm">{new Date(viewingEvent.created_at).toLocaleDateString('en-US')}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Attendees</label>
                <p className="text-sm font-medium text-blue-600">{viewingEvent.attendeesCount}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Views</label>
                <p className="text-sm font-medium text-green-600">{viewingEvent.viewsCount}</p>
              </div>
            </div>
            {viewingEvent.description && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                <div className="max-h-40 overflow-y-auto">
                  <p className="text-sm leading-relaxed">{viewingEvent.description}</p>
                </div>
              </div>
            )}
          </div>
        </UniversalModal>
      )}
    </div>
  )
}