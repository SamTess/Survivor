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
  Building2,
  X,
  Save,
  Loader2
} from 'lucide-react'

// Types pour les projets/startups basés sur le schéma Prisma
interface Project {
  id: number
  name: string
  legal_status: string
  sector: string
  maturity: string
  address: string
  phone: string
  email: string
  description: string
  created_at: string
  viewsCount: number
  likesCount: number
  bookmarksCount: number
  followersCount: number
}

interface ProjectFormData {
  name: string
  legal_status: string
  sector: string
  maturity: string
  address: string
  phone: string
  email: string
  description: string
}

const LEGAL_STATUSES = [
  'SARL', 'SAS', 'SA', 'SNC', 'Société civile', 'Auto-entrepreneur', 'Association', 'Autre'
]

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Gaming', 
  'Food & Agriculture', 'Energy', 'Transportation', 'Real Estate', 'Media', 'Other'
]

const MATURITIES = [
  'Idea', 'Prototype', 'MVP', 'Early Stage', 'Growth', 'Mature', 'Scale-up'
]

export default function ProjectsCrudSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [selectedMaturity, setSelectedMaturity] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    legal_status: '',
    sector: '',
    maturity: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les projets au démarrage
  useEffect(() => {
    fetchProjects()
  }, [])

  // Filtrer les projets
  useEffect(() => {
    let filtered = projects
    
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedSector) {
      filtered = filtered.filter(project => project.sector === selectedSector)
    }
    
    if (selectedMaturity) {
      filtered = filtered.filter(project => project.maturity === selectedMaturity)
    }
    
    setFilteredProjects(filtered)
  }, [projects, searchTerm, selectedSector, selectedMaturity])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/startups')
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.data)
      } else {
        console.error('Error fetching projects:', data.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setFormData({
      name: '',
      legal_status: '',
      sector: '',
      maturity: '',
      address: '',
      phone: '',
      email: '',
      description: ''
    })
    setIsModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      legal_status: project.legal_status,
      sector: project.sector,
      maturity: project.maturity,
      address: project.address,
      phone: project.phone,
      email: project.email,
      description: project.description
    })
    setIsModalOpen(true)
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return

    try {
      const response = await fetch(`/api/startups/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id))
        alert('Projet supprimé avec succès!')
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingProject ? `/api/startups/${editingProject.id}` : '/api/startups'
      const method = editingProject ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchProjects() // Recharger la liste
        setIsModalOpen(false)
        alert(`Projet ${editingProject ? 'modifié' : 'créé'} avec succès!`)
      } else {
        alert(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getMaturityColor = (maturity: string) => {
    const colors = {
      'Idea': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'Prototype': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'MVP': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Early Stage': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Growth': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Mature': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Scale-up': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    }
    return colors[maturity as keyof typeof colors] || colors['Idea']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des projets...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Projets</h2>
          <p className="text-muted-foreground">Gérez les startups et projets de votre plateforme</p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus size={16} />
          Nouveau Projet
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Rechercher par nom, description ou email..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">Tous les secteurs</option>
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedMaturity}
              onChange={(e) => setSelectedMaturity(e.target.value)}
            >
              <option value="">Toutes les maturités</option>
              {MATURITIES.map(maturity => (
                <option key={maturity} value={maturity}>{maturity}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Projets ({filteredProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun projet trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Nom</th>
                    <th className="text-left py-3 px-2">Secteur</th>
                    <th className="text-left py-3 px-2">Maturité</th>
                    <th className="text-left py-3 px-2">Statut légal</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Créé le</th>
                    <th className="text-left py-3 px-2">Vues</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{project.name}</td>
                      <td className="py-3 px-2">{project.sector}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaturityColor(project.maturity)}`}>
                          {project.maturity}
                        </span>
                      </td>
                      <td className="py-3 px-2">{project.legal_status}</td>
                      <td className="py-3 px-2">{project.email}</td>
                      <td className="py-3 px-2">{formatDate(project.created_at)}</td>
                      <td className="py-3 px-2">{project.viewsCount}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
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

      {/* Modal de création/édition */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Statut légal *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.legal_status}
                    onChange={(e) => setFormData({ ...formData, legal_status: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    {LEGAL_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Secteur *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    {SECTORS.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Maturité *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.maturity}
                    onChange={(e) => setFormData({ ...formData, maturity: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    {MATURITIES.map(maturity => (
                      <option key={maturity} value={maturity}>{maturity}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Adresse *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editingProject ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
