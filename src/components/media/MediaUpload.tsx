'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface FileUploadResponse {
  success: boolean;
  file?: {
    id: number;
    filename: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description: string | null;
    tags: string | null;
    isPublic: boolean;
    createdAt: string;
  };
  error?: string;
}

interface Props {
  onUploadSuccess?: (file: FileUploadResponse['file']) => void;
}

export default function MediaUpload({ onUploadSuccess }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4', 'video/webm', 'video/avi', 'video/mov'
  ];

  const maxFileSize = 100 * 1024 * 1024;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please select an image, document, or video file.');
      return;
    }

    if (file.size > maxFileSize) {
      setError(`File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('isPublic', isPublic.toString());

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const result: FileUploadResponse = await response.json();

      if (result.success && result.file) {
        setSuccess(`File "${result.file.originalName}" uploaded successfully!`);
        setSelectedFile(null);
        setDescription('');
        setTags('');
        setIsPublic(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadSuccess?.(result.file);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDescription('');
    setTags('');
    setIsPublic(false);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={allowedTypes.join(',')}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground">
            Supported: Images, Documents (PDF, Word, Excel), Videos (MP4, WebM). Max size: 100MB
          </p>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your file..."
            className="min-h-[80px]"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (Optional)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., pitch-deck, product-demo, marketing"
          />
          <p className="text-sm text-muted-foreground">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Public/Private Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="public-toggle"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="public-toggle">
            Make this file publicly viewable
          </Label>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          {selectedFile && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
