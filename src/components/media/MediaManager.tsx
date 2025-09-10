'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  File, Image, Video, Music, FileText, Download, Trash2,
  Eye, EyeOff, Search, Grid, List
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  description: string | null;
  tags: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface StorageInfo {
  used: number;
  max: number;
  usedMB: number;
  maxMB: number;
  percentUsed: number;
}

interface MediaListResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  storage: StorageInfo | null;
}

export default function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const VideoPreview = ({ file }: { file: MediaFile }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-8 w-8 text-gray-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
        <img
          src={`/api/media/${file.id}/preview`}
          alt={`${file.original_name} preview`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
          <Video className="h-8 w-8 text-white" />
        </div>
      </div>
    );
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(fileType !== 'all' && { type: fileType })
      });

      const response = await fetch(`/api/media?${params}`);
      const data: MediaListResponse = await response.json();

      if (response.ok) {
        setFiles(data.files);
        setStorage(data.storage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [page, fileType]);

  const handleDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/media?id=${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFiles();
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDownload = async (fileId: number, originalName: string) => {
    try {
      const response = await fetch(`/api/media/${fileId}/download`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const renderFilePreview = (file: MediaFile) => {
    if (file.file_type === 'image') {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
          <img
            src={`/api/media/${file.id}`}
            alt={file.original_name}
            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            onClick={() => window.open(`/api/media/${file.id}`, '_blank')}
          />
        </div>
      );
    } else if (file.file_type === 'video') {
      return (
        <VideoPreview file={file} />
      );
    } else {
      return (
        <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
          {getFileIcon(file.file_type)}
        </div>
      );
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file =>
    file.original_name.toLowerCase().includes(search.toLowerCase()) ||
    file.description?.toLowerCase().includes(search.toLowerCase()) ||
    file.tags?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      {storage && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{storage.usedMB.toFixed(1)} MB used</span>
                <span>{storage.maxMB.toFixed(0)} MB total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(storage.percentUsed, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {(100 - storage.percentUsed).toFixed(1)}% remaining
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      <Card>
        <CardHeader>
          <CardTitle>My Files ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {renderFilePreview(file)}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {file.is_public ? (
                            <Eye className="h-3 w-3 text-green-600" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate" title={file.original_name}>
                          {file.original_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                      {file.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {file.description}
                        </p>
                      )}
                      {file.tags && (
                        <div className="flex flex-wrap gap-1">
                          {file.tags.split(',').slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(file.id, file.original_name)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.original_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                        {file.is_public ? (
                          <Badge variant="secondary" className="text-xs">Public</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Private</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file.id, file.original_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
