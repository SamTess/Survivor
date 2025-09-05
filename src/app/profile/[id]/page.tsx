'use client';

import React, { useState, useEffect } from 'react';
import { UserApiResponse } from '@/domain/interfaces/User';
import { formatDate } from '@/utils/dateUtils';
import { ProtectedRoute, useAuth } from '@/context/auth';
import { apiService } from '@/infrastructure/services/ApiService';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = React.use(params);
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserApiResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isOwnProfile = user?.id === currentUser?.id;

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get<UserApiResponse>(`/users/${id}`);
        console.log('Fetch user response:', response);
        if (response.success && response.data) {
          setUser(response.data);
          setEditedUser(response.data);
        } else {
          setError(response.error || 'Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
  };

  const handleSave = async () => {
    if (!editedUser || !user) return;

    setSaving(true);
    setError(null);

    try {
      const response = await apiService.put<UserApiResponse>(`/users/${user.id}`, {
        name: editedUser.name,
        email: editedUser.email,
        role: editedUser.role,
      });

      if (response.success && response.data) {
        setUser(response.data);
        setEditedUser(response.data);
        setIsEditing(false);
      } else {
        setError(response.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserApiResponse, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value,
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'founder':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'investor':
        return 'bg-accent/10 text-accent border border-accent/20';
      case 'admin':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'mentor':
        return 'bg-primary/20 text-primary border border-primary/30';
      default:
        return 'bg-muted/50 text-foreground border border-border/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error ? 'Error Loading User' : 'User Not Found'}
          </h1>
          <p className="text-muted-foreground">
            {error || "The user you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} fallback={<div className="min-h-screen flex items-center justify-center">Please login to proceed</div>}>
      <div className="min-h-screen bg-background py-5 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 pt-20">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-down">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-card/80 backdrop-blur-md border border-border/20 shadow rounded-2xl mb-6 transition-all duration-300">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}
                  </div>

                  {/* Basic Info */}
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-3xl font-bold text-foreground border-b-2 border-border bg-transparent focus:outline-none focus:border-primary transition-all duration-200"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-foreground">{user?.name || 'Unknown User'}</h1>
                    )}

                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-sm font-medium backdrop-blur-md ${getRoleColor(user?.role || 'user')}`}>
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isOwnProfile && (
                  <div className="flex space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl hover:bg-primary/90 transition-all duration-200 border border-primary/20 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving && (
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          )}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="bg-muted text-foreground px-4 py-2 rounded-2xl hover:bg-muted/80 transition-all duration-200 border border-border/20 backdrop-blur-md disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl hover:bg-primary/90 transition-all duration-200 border border-primary/20 backdrop-blur-md"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2">
              <div className="bg-card/80 backdrop-blur-md border border-border/20 shadow rounded-2xl p-6 transition-all duration-300">
                <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-background/80 backdrop-blur-md text-foreground transition-all duration-200"
                      />
                    ) : (
                      <p className="text-foreground">{user?.email || 'No email provided'}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role
                    </label>
                    {isEditing ? (
                      <select
                        value={editedUser?.role || ''}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-background/80 backdrop-blur-md text-foreground transition-all duration-200"
                      >
                        <option value="founder">Founder</option>
                        <option value="investor">Investor</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <p className="text-foreground capitalize">{user?.role || 'User'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Account Dates */}
              <div className="bg-card/80 backdrop-blur-md border border-border/20 shadow rounded-2xl p-6 transition-all duration-300">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Member Since</p>
                    <p className="text-muted-foreground">{user?.created_at ? formatDate(user.created_at) : 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Last Updated</p>
                    <p className="text-muted-foreground">{user?.updated_at ? formatDate(user.updated_at) : 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card/80 backdrop-blur-md border border-border/20 shadow rounded-2xl p-6 transition-all duration-300">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-semibold text-muted-foreground">#{user?.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-accent font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
