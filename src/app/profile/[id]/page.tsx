'use client';

import React, { useState, useEffect } from 'react';
import { UserApiResponse } from '@/domain/interfaces/User';
import { formatDate } from '@/utils/dateUtils';
import usersData from '@/mocks/users.json'; // TODO REMOVE

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = React.use(params);
  const [user, setUser] = useState<UserApiResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // TODO : get current user from auth context
  const currentUserId = 1;
  const isOwnProfile = user?.id === currentUserId;

  useEffect(() => {
	// TODO
	const fetchUser = async () => {
      setLoading(true);
      try {
        const foundUser = usersData.find(u => u.id === parseInt(id));
        if (foundUser) {
          setUser(foundUser as UserApiResponse);
          setEditedUser(foundUser as UserApiResponse);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
  };

  const handleSave = () => {
	// TODO REMOVE
	console.log('Saving user:', editedUser);
    setUser(editedUser);
    setIsEditing(false);
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
          <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
          <p className="text-muted-foreground">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-5 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 pt-20">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-md border border-border/20 shadow rounded-2xl mb-6 transition-all duration-300">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
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
                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  )}

                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-sm font-medium backdrop-blur-md ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl hover:bg-primary/90 transition-all duration-200 border border-primary/20 backdrop-blur-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-muted text-foreground px-4 py-2 rounded-2xl hover:bg-muted/80 transition-all duration-200 border border-border/20 backdrop-blur-md"
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
                    <p className="text-foreground">{user.email}</p>
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
                    <p className="text-foreground capitalize">{user.role}</p>
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
                  <p className="text-muted-foreground">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Last Updated</p>
                  <p className="text-muted-foreground">{formatDate(user.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card/80 backdrop-blur-md border border-border/20 shadow rounded-2xl p-6 transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-semibold text-muted-foreground">#{user.id}</span>
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
  );
}
