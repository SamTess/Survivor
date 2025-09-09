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
  Users,
  Shield,
  Loader2,
  Mail,
  Phone
} from 'lucide-react'

// Types for users based on Prisma schema
interface User {
  id: number
  name: string
  email: string
  address: string
  phone?: string
  legal_status?: string
  description?: string
  role: string
  created_at: string
  followersCount: number
  permissions?: Permission[]
}

interface Permission {
  id: number
  name: string
  description?: string
  can_create: boolean
  can_read: boolean
  can_update: boolean
  can_delete: boolean
  user_id: number
}

interface PermissionFormData {
  name: string
  description: string
  can_create: boolean
  can_read: boolean
  can_update: boolean
  can_delete: boolean
}

interface UserFormData {
  name: string
  email: string
  address: string
  phone: string
  legal_status: string
  description: string
  role: string
  password?: string
}

const USER_ROLES = [
  'admin', 'moderator', 'user', 'investor', 'founder', 'partner', 'guest'
]

const LEGAL_STATUSES = [
  'Individual', 'Company', 'Association', 'Foundation', 'Other'
]

const PERMISSION_TEMPLATES = [
  {
    name: 'Startups Management',
    description: 'Manage startup profiles and information',
    can_create: true,
    can_read: true,
    can_update: true,
    can_delete: true
  },
  {
    name: 'News Management',
    description: 'Manage news articles and announcements',
    can_create: true,
    can_read: true,
    can_update: true,
    can_delete: false
  },
  {
    name: 'Events Management',
    description: 'Manage events and activities',
    can_create: true,
    can_read: true,
    can_update: true,
    can_delete: true
  },
  {
    name: 'User Management',
    description: 'Manage user accounts and roles',
    can_create: false,
    can_read: true,
    can_update: true,
    can_delete: false
  }
]

export default function AdminUsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null)
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    address: '',
    phone: '',
    legal_status: '',
    description: '',
    role: 'user',
    password: ''
  })

  const [permissionFormData, setPermissionFormData] = useState<PermissionFormData>({
    name: '',
    description: '',
    can_create: false,
    can_read: true,
    can_update: false,
    can_delete: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load users on startup
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.description && user.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, selectedRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      } else {
        toast.error('Error loading users', {
          description: data.error
        })
      }
    } catch {
      toast.error('Error loading users', {
        description: 'An error occurred while fetching data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setIsUserModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsUserModalOpen(true)
  }

  const handleViewUser = (user: User) => {
    setViewingUser(user)
    setIsViewModalOpen(true)
  }

  const handleManagePermissions = (user: User) => {
    setSelectedUserForPermissions(user)
    setPermissionFormData({
      name: '',
      description: '',
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false
    })
    setIsPermissionModalOpen(true)
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
        toast.success('User deleted successfully!')
      } else {
        toast.error('Deletion error', {
          description: 'Unable to delete this user'
        })
      }
    } catch {
      toast.error('Deletion error', {
        description: 'A network error occurred'
      })
    }
  }

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      // Don't send password if empty during editing
      const submitData = { ...userFormData }
      if (editingUser && !submitData.password) {
        delete submitData.password
      }

      // Ensure no id is sent when creating a new user
      if (!editingUser && 'id' in submitData) {
        delete (submitData as Record<string, unknown>).id
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
        await fetchUsers() // Reload the list
        setIsUserModalOpen(false)
        toast.success(`User ${editingUser ? 'updated' : 'created'} successfully!`, {
          description: `${data.data.name} has been ${editingUser ? 'updated' : 'added'} to the database`
        })
      } else {
        toast.error(`Error ${editingUser ? 'updating' : 'creating'} user`, {
          description: data.error
        })
      }
    } catch {
      toast.error(`Error ${editingUser ? 'updating' : 'creating'} user`, {
        description: 'A network error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitPermission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForPermissions) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...permissionFormData,
          user_id: selectedUserForPermissions.id
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Permission added successfully!', {
          description: `Permission "${permissionFormData.name}" granted to ${selectedUserForPermissions.name}`
        })
        setIsPermissionModalOpen(false)
        // Optional: reload users to have updated permissions
        await fetchUsers()
      } else {
        toast.error('Error adding permission', {
          description: data.error
        })
      }
    } catch {
      toast.error('Error adding permission', {
        description: 'A network error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyPermissionTemplate = (template: typeof PERMISSION_TEMPLATES[0]) => {
    setPermissionFormData(template)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  const getRoleColor = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'moderator': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'user': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'investor': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'founder': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'partner': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'guest': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
    return colors[role as keyof typeof colors] || colors['user']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Users Management</h2>
          <p className="text-muted-foreground">Manage user accounts, their roles and permissions</p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <Plus size={16} />
          New User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by name, email or description..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All roles</option>
              {USER_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-left py-3 px-2">Role</th>
                    <th className="text-left py-3 px-2">Contact</th>
                    <th className="text-left py-3 px-2">Legal Status</th>
                    <th className="text-left py-3 px-2">Created</th>
                    <th className="text-left py-3 px-2">Followers</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {user.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail size={12} className="text-muted-foreground" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone size={12} className="text-muted-foreground" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">{user.legal_status || '-'}</td>
                      <td className="py-3 px-2">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-2">{user.followersCount}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            onClick={() => handleManagePermissions(user)}
                            title="Manage Permissions"
                          >
                            <Shield size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
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

      {/* User creation/edit modal */}
      <FormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleSubmitUser}
        title={editingUser ? 'Edit User' : 'New User'}
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="user-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Enter full name"
                aria-describedby="name-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={userFormData?.name || ''}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              />
              <div id="name-help" className="text-xs text-muted-foreground mt-1">
                Enter the user&apos;s full name
              </div>
            </div>

            <div>
              <label htmlFor="user-email" className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="user-email"
                type="email"
                required
                autoComplete="email"
                placeholder="user@example.com"
                aria-describedby="email-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={userFormData?.email || ''}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
              <div id="email-help" className="text-xs text-muted-foreground mt-1">
                Valid email format required (e.g., user@domain.com)
              </div>
            </div>

            <div>
              <label htmlFor="user-password" className="block text-sm font-medium mb-1">
                Password {editingUser ? '(leave empty to keep unchanged)' : <span className="text-red-500">*</span>}
              </label>
              <input
                id="user-password"
                type="password"
                required={!editingUser}
                autoComplete={editingUser ? "current-password" : "new-password"}
                placeholder={editingUser ? "Leave empty to keep current" : "Enter password"}
                aria-describedby="password-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={userFormData?.password || ''}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              />
              <div id="password-help" className="text-xs text-muted-foreground mt-1">
                {editingUser ? "Leave empty to keep current password" : "Minimum 8 characters required"}
              </div>
            </div>

            <div>
              <label htmlFor="user-role" className="block text-sm font-medium mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="user-role"
                required
                autoComplete="organization-title"
                aria-describedby="role-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={userFormData?.role || 'user'}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <div id="role-help" className="text-xs text-muted-foreground mt-1">
                Select the user&apos;s role in the system
              </div>
            </div>

            <div>
              <label htmlFor="user-phone" className="block text-sm font-medium mb-1">Phone</label>
              <input
                id="user-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+33 6 12 34 56 78"
                aria-describedby="phone-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={userFormData?.phone || ''}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
              />
              <div id="phone-help" className="text-xs text-muted-foreground mt-1">
                Format: +33 6 12 34 56 78 or 06 12 34 56 78
              </div>
            </div>

            <div>
              <label htmlFor="user-legal-status" className="block text-sm font-medium mb-1">Legal Status</label>
              <select
                id="user-legal-status"
                autoComplete="organization"
                aria-describedby="legal-status-help"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={userFormData?.legal_status || ''}
                onChange={(e) => setUserFormData({ ...userFormData, legal_status: e.target.value })}
              >
                <option value="">Select legal status</option>
                {LEGAL_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div id="legal-status-help" className="text-xs text-muted-foreground mt-1">
                Choose the legal structure of the user
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="user-address" className="block text-sm font-medium mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              id="user-address"
              type="text"
              required
              autoComplete="address-line1"
              placeholder="123 Main Street, City, Country"
              aria-describedby="address-help"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={userFormData?.address || ''}
              onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
            />
            <div id="address-help" className="text-xs text-muted-foreground mt-1">
              Enter the complete address including street, city, and country
            </div>
          </div>

          <div>
            <label htmlFor="user-description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="user-description"
              rows={3}
              autoComplete="off"
              placeholder="Optional description about the user"
              aria-describedby="description-help"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={userFormData?.description || ''}
              onChange={(e) => setUserFormData({ ...userFormData, description: e.target.value })}
            />
            <div id="description-help" className="text-xs text-muted-foreground mt-1">
              Optional: Add any additional information about the user
            </div>
          </div>
        </div>
      </FormModal>

      {/* Modal de gestion des permissions */}
      {isPermissionModalOpen && selectedUserForPermissions && (
        <UniversalModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          title={`Permissions pour ${selectedUserForPermissions.name}`}
          size="xl"
          actions={[
            {
              label: "Fermer",
              onClick: () => setIsPermissionModalOpen(false),
              variant: "outline"
            }
          ]}
        >
          <div className="space-y-6">
            {/* Permission templates */}
            <div>
              <h4 className="text-sm font-medium mb-3">Modèles de permissions rapides</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PERMISSION_TEMPLATES.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPermissionTemplate(template)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom permission form */}
            <form onSubmit={handleSubmitPermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la permission *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={permissionFormData.name}
                  onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={permissionFormData.description}
                  onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Droits d&apos;accès</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissionFormData.can_create}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, can_create: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Créer</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissionFormData.can_read}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, can_read: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Lire</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissionFormData.can_update}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, can_update: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Modifier</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissionFormData.can_delete}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, can_delete: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Supprimer</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPermissionModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Fermer
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Shield size={16} />
                  )}
                  Ajouter la permission
                </Button>
              </div>
            </form>
          </div>
        </UniversalModal>
      )}

      {/* View Modal */}
      {viewingUser && (
        <UniversalModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="User Details"
          size="auto"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <p className="text-sm font-medium">{viewingUser.name}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                <p className="text-sm break-all">{viewingUser.email}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</label>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {viewingUser.role}
                </span>
              </div>
              {viewingUser.phone && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                  <p className="text-sm">{viewingUser.phone}</p>
                </div>
              )}
              {viewingUser.legal_status && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Legal Status</label>
                  <p className="text-sm">{viewingUser.legal_status}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
                <p className="text-sm">{new Date(viewingUser.created_at).toLocaleDateString('en-US')}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
              <p className="text-sm">{viewingUser.address}</p>
            </div>
            {viewingUser.description && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                <div className="max-h-32 overflow-y-auto">
                  <p className="text-sm leading-relaxed">{viewingUser.description}</p>
                </div>
              </div>
            )}
          </div>
        </UniversalModal>
      )}
    </div>
  )
}