export interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_type: 'image' | 'document' | 'video' | 'audio' | 'other';
  mime_type: string;
  file_size: number;
  file_path: string;
  description: string | null;
  tags: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorageQuota {
  user_id: number;
  used_bytes: bigint;
  max_bytes: bigint;
  last_updated: string;
}

export interface StorageInfo {
  used: number;
  max: number;
  usedMB: number;
  maxMB: number;
  percentUsed: number;
}

export interface MediaUploadRequest {
  file: File;
  description?: string;
  tags?: string;
  isPublic?: boolean;
}

export interface MediaUploadResponse {
  success: boolean;
  file?: MediaFile;
  error?: string;
}

export interface MediaListResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  storage: StorageInfo | null;
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  type?: string;
  public?: boolean;
  search?: string;
}

export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4']
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const DEFAULT_STORAGE_QUOTA = 2 * 1024 * 1024 * 1024;
