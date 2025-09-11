'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MediaUpload from '@/components/media/MediaUpload';
import MediaManager from '@/components/media/MediaManager';
import { Upload, FolderOpen } from 'lucide-react';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('manage');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Media Storage</h1>
        <p className="text-muted-foreground">
          Upload and manage your documents, images, and other media files.
          Each founder gets 2GB of storage space.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Manage Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="flex justify-center">
            <MediaUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <MediaManager key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
