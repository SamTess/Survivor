'use client';

import React, { useState, useRef, useCallback } from 'react';
import { apiService } from '@/infrastructure/services/ApiService';
import UserAvatar from './UserAvatar';

interface ProfilePictureUploadProps {
  userId: number;
  userName?: string;
  size?: number;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export default function ProfilePictureUpload({
  userId,
  userName,
  size = 96,
  onUploadSuccess,
  onUploadError,
  disabled = false
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/users/${userId}/image`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update refresh key to force UserAvatar to reload the image
        setRefreshKey(Date.now());
        onUploadSuccess?.();
      } else {
        onUploadError?.(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('An unexpected error occurred while uploading');
    } finally {
      setUploading(false);
    }
  }, [userId, onUploadSuccess, onUploadError]);

  const handleDeletePicture = useCallback(async () => {
    setUploading(true);

    try {
      const response = await apiService.delete(`/users/${userId}/image`);

      if (response.success) {
        onUploadSuccess?.();

        // Force UserAvatar to refresh
        const avatarImages = document.querySelectorAll(`img[src*="/api/users/${userId}/image"], img[src*="/users/${userId}/image"]`);
        avatarImages.forEach((img) => {
          const imgElement = img as HTMLImageElement;
          imgElement.src = '';
        });
      } else {
        onUploadError?.(response.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      onUploadError?.('An unexpected error occurred while deleting');
    } finally {
      setUploading(false);
    }
  }, [userId, onUploadSuccess, onUploadError]);

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    if (disabled || uploading) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="relative group">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer transition-all duration-200
          ${dragOver ? 'scale-105 ring-2 ring-primary/50' : ''}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
        `}
        style={{ width: size, height: size }}
      >
        <UserAvatar uid={userId} name={userName} size={size} refreshKey={refreshKey} />

        {/* Upload overlay */}
        {!disabled && (
          <div className={`
            absolute inset-0 rounded-full flex items-center justify-center
            bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200
            ${uploading ? 'opacity-100' : ''}
          `}>
            {uploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Delete button */}
      {!disabled && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeletePicture();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 shadow-md"
          title="Delete profile picture"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Drag overlay */}
      {dragOver && !disabled && (
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-xs font-medium">Drop image</span>
        </div>
      )}
    </div>
  );
}
