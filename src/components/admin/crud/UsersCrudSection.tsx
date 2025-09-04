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
  Users,
  Shield,
  X,
  Save,
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

interface PermissionFormData {
  name: string
  description: string
  can_create: boolean
  can_read: boolean
  can_update: boolean
  can_delete: boolean
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

export default function UsersCrudSection() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
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
        console.error('Error fetching users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setUserFormData({
      name: '',
      email: '',
      address: '',
      phone: '',
      legal_status: '',
      description: '',
      role: 'user',
      password: ''
    })
    setIsUserModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserFormData({
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone || '',
      legal_status: user.legal_status || '',
      description: user.description || '',
      role: user.role,
      password: '' // Don't display existing password
    })
    setIsUserModalOpen(true)
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
        alert('User deleted successfully!')
      } else {
        alert('Error during deletion')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error during deletion')
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
        alert(`User ${editingUser ? 'updated' : 'created'} successfully!`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error during save')
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
        alert('Permission added successfully!')
        setIsPermissionModalOpen(false)
        // Optional: reload users to have updated permissions
        await fetchUsers()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving permission:', error)
      alert('Error during save')
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Edit User' : 'New User'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password {editingUser ? '(leave empty to keep unchanged)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  >
                    {USER_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Legal Status</label>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={userFormData.legal_status}
                    onChange={(e) => setUserFormData({ ...userFormData, legal_status: e.target.value })}
                  >
                    <option value="">Select</option>
                    {LEGAL_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={userFormData.address}
                  onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={userFormData.description}
                  onChange={(e) => setUserFormData({ ...userFormData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUserModalOpen(false)}
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
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de gestion des permissions */}
      {isPermissionModalOpen && selectedUserForPermissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                Permissions pour {selectedUserForPermissions.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPermissionModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Permission templates */}
              <div>
                <h4 className="text-sm font-medium mb-3">Quick permission templates</h4>
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
                  <label className="block text-sm font-medium mb-1">Permission Name *</label>
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
                  <label className="block text-sm font-medium mb-3">Access Rights</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={permissionFormData.can_create}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, can_create: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Create</span>
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
                      <span className="text-sm">Update</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={permissionFormData.can_delete}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, can_delete: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Delete</span>
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
                    Close
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Shield size={16} />
                    )}
                    Add Permission
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
