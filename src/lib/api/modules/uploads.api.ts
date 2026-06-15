// =============================================================================
// BizOS API SDK — File Uploads Module
// =============================================================================

import { apiClient } from '../client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UploadContext = 'product_image' | 'receipt' | 'logo' | 'attachment';

export interface UploadedFile {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Upload a single file.
 * @param file - The File object from an <input type="file"> or drag-and-drop
 * @param context - The usage context (used for server-side path routing)
 * @param onProgress - Optional upload progress callback (0–100)
 */
export async function uploadFile(
  file: File,
  context: UploadContext = 'attachment',
  onProgress?: (percentage: number) => void,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', context);

  const res = await apiClient.post<UploadedFile>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(pct);
          }
        }
      : undefined,
  });

  return res.data;
}

/**
 * Upload multiple files at once (parallel uploads)
 */
export async function uploadFiles(
  files: File[],
  context: UploadContext = 'attachment',
): Promise<UploadedFile[]> {
  return Promise.all(files.map((f) => uploadFile(f, context)));
}
