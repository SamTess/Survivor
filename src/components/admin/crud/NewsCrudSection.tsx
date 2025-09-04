"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  X,
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

interface News {
  id: number
  title: string
  description?: string
  image_data?: Uint8Array | null
  startup_id: number
  news_date?: string
  location?: string
  category?: string
  created_at: string
  viewsCount: number
  likesCount: number
  bookmarksCount: number
  sharesCount: number
  startup?: {
    name: string
  }
}

interface NewsFormData {
  title: string
  description: string
  startup_id: string
  news_date: string
  location: string
  category: string
}

const NEWS_CATEGORIES = [
  'Product Launch', 'Funding', 'Partnership', 'Award', 'Event', 'Announcement', 'Press Release', 'Other'
]

export default function NewsCrudSection() {
  const [news, setNews] = useState<News[]>([])
  const [filteredNews, setFilteredNews] = useState<News[]>([])
  const [startups, setStartups] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStartup, setSelectedStartup] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    description: '',
    startup_id: '',
    news_date: '',
    location: '',
    category: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchNews()
    fetchStartups()
  }, [])

  useEffect(() => {
    let filtered = news

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (selectedStartup) {
      filtered = filtered.filter(item => item.startup_id === parseInt(selectedStartup))
    }

    setFilteredNews(filtered)
  }, [news, searchTerm, selectedCategory, selectedStartup])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news')
      const data = await response.json()

      if (data.success) {
        setNews(data.data)
      } else {
        console.error('Error fetching news:', data.error)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStartups = async () => {
    try {
      const response = await fetch('/api/startups')
      const data = await response.json()

      if (data.success) {
        setStartups(data.data.map((s: {id: number, name: string}) => ({ id: s.id, name: s.name })))
      } else {
        console.error('Error fetching startups:', data.error)
      }
    } catch (error) {
      console.error('Error fetching startups:', error)
    }
  }

  const handleCreateNews = () => {
    setEditingNews(null)
    setFormData({
      title: '',
      description: '',
      startup_id: '',
      news_date: '',
      location: '',
      category: ''
    })
    setIsModalOpen(true)
  }

  const handleEditNews = (newsItem: News) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      description: newsItem.description || '',
      startup_id: newsItem.startup_id.toString(),
      news_date: newsItem.news_date ? newsItem.news_date.split('T')[0] : '',
      location: newsItem.location || '',
      category: newsItem.category || ''
    })
    setIsModalOpen(true)
  }

  const handleDeleteNews = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNews(news.filter(n => n.id !== id))
        alert('Article deleted successfully!')
      } else {
        alert('Error during deletion')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Error during deletion')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingNews ? `/api/news/${editingNews.id}` : '/api/news'
      const method = editingNews ? 'PUT' : 'POST'

      const submitData = {
        ...formData,
        startup_id: parseInt(formData.startup_id),
        news_date: formData.news_date ? new Date(formData.news_date).toISOString() : null
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
        await fetchNews()
        setIsModalOpen(false)
        alert(`Article ${editingNews ? 'updated' : 'created'} successfully!`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Error during save')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  const getCategoryColor = (category?: string) => {
    const colors = {
      'Product Launch': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Funding': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Partnership': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Award': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Event': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Announcement': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Press Release': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
    return colors[category as keyof typeof colors] || colors['Other']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading articles...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">News Management</h2>
          <p className="text-muted-foreground">Manage articles and news from your startups</p>
        </div>
        <Button onClick={handleCreateNews} className="flex items-center gap-2">
          <Plus size={16} />
          New Article
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {NEWS_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedStartup}
              onChange={(e) => setSelectedStartup(e.target.value)}
            >
              <option value="">Toutes les startups</option>
              {startups.map(startup => (
                <option key={startup.id} value={startup.id}>{startup.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Articles ({filteredNews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No articles found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Title</th>
                    <th className="text-left py-3 px-2">Startup</th>
                    <th className="text-left py-3 px-2">Category</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Location</th>
                    <th className="text-left py-3 px-2">Views</th>
                    <th className="text-left py-3 px-2">Likes</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map((newsItem) => (
                    <tr key={newsItem.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="flex items-start gap-2">
                          {newsItem.image_data && (
                            <ImageIcon size={16} className="text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium">{newsItem.title}</div>
                            {newsItem.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {newsItem.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">{newsItem.startup?.name || 'N/A'}</td>
                      <td className="py-3 px-2">
                        {newsItem.category && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(newsItem.category)}`}>
                            {newsItem.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {newsItem.news_date ? formatDate(newsItem.news_date) : '-'}
                      </td>
                      <td className="py-3 px-2">{newsItem.location || '-'}</td>
                      <td className="py-3 px-2">{newsItem.viewsCount}</td>
                      <td className="py-3 px-2">{newsItem.likesCount}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditNews(newsItem)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteNews(newsItem.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingNews ? 'Edit Article' : 'New Article'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Startup *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.startup_id}
                    onChange={(e) => setFormData({ ...formData, startup_id: e.target.value })}
                  >
                    <option value="">Select a startup</option>
                    {startups.map(startup => (
                      <option key={startup.id} value={startup.id}>{startup.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {NEWS_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">News Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.news_date}
                    onChange={(e) => setFormData({ ...formData, news_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editingNews ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
