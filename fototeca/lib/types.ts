export type MediaType = 'image' | 'video';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export interface UploadResponse {
    success: boolean;
    path: string;
    type: MediaType;
    size: number;
    name: string;
}

export interface UploadError {
    error: string;
} 