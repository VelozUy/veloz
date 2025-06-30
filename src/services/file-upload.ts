import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadTaskSnapshot,
  UploadTask,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import type { ApiResponse } from '@/types';

// File upload configuration
export interface FileUploadConfig {
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  generateThumbnails?: boolean;
  compressionQuality?: number;
}

// File upload result
export interface FileUploadResult {
  url: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

// File upload progress
export interface FileUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
  timeRemaining?: number;
  speed?: number; // bytes per second
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Default configurations for different file types
const DEFAULT_CONFIGS: Record<string, FileUploadConfig> = {
  image: {
    maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
    ],
    allowedExtensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.bmp',
      '.tiff',
      '.svg',
    ],
    generateThumbnails: true,
    compressionQuality: 0.8,
  },
  video: {
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/ogg',
      'video/3gpp',
      'video/x-ms-wmv',
    ],
    allowedExtensions: [
      '.mp4',
      '.mov',
      '.avi',
      '.webm',
      '.ogv',
      '.3gp',
      '.wmv',
    ],
    generateThumbnails: false,
    compressionQuality: 0.7,
  },
  document: {
    maxFileSizeBytes: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    allowedExtensions: [
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.txt',
      '.csv',
    ],
    generateThumbnails: false,
  },
};

/**
 * Firebase Storage Service
 * Handles file uploads, validation, progress tracking, and file management
 */
export class FileUploadService {
  private uploadTasks: Map<string, UploadTask> = new Map();
  private progressCallbacks: Map<
    string,
    (progress: FileUploadProgress) => void
  > = new Map();

  /**
   * Validate a file against upload configuration
   */
  validateFile(
    file: File,
    config: FileUploadConfig = {}
  ): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (config.maxFileSizeBytes && file.size > config.maxFileSizeBytes) {
      errors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(config.maxFileSizeBytes)})`
      );
    }

    // Check MIME type
    if (
      config.allowedMimeTypes &&
      !config.allowedMimeTypes.includes(file.type)
    ) {
      errors.push(
        `File type "${file.type}" is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`
      );
    }

    // Check file extension
    if (config.allowedExtensions) {
      const fileExtension = this.getFileExtension(file.name).toLowerCase();
      if (
        !config.allowedExtensions.some(
          ext => ext.toLowerCase() === fileExtension
        )
      ) {
        errors.push(
          `File extension "${fileExtension}" is not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`
        );
      }
    }

    // Check for potential issues
    if (file.size === 0) {
      errors.push('File is empty');
    }

    if (file.name.length > 255) {
      warnings.push('File name is very long and may cause issues');
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com|msi|dll)$/i,
      /^\./, // Hidden files
      /[<>:"|?*]/, // Invalid characters
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        errors.push(
          'File name contains invalid characters or suspicious extension'
        );
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Upload a single file to Firebase Storage
   */
  async uploadFile(
    file: File,
    path: string,
    config: FileUploadConfig = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<ApiResponse<FileUploadResult>> {
    try {
      // Generate unique task ID
      const taskId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Validate file
      const validation = this.validateFile(file, config);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; '),
          data: undefined,
        };
      }

      // Sanitize file name and create full path
      const sanitizedFileName = this.sanitizeFileName(file.name);
      const fullPath = `${path}/${sanitizedFileName}`;
      const storageRef = ref(storage, fullPath);

      // Set up upload metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin', // TODO: Replace with actual user ID
          fileSize: file.size.toString(),
          taskId,
        },
      };

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      this.uploadTasks.set(taskId, uploadTask);

      if (onProgress) {
        this.progressCallbacks.set(taskId, onProgress);
      }

      // Track upload progress
      return new Promise(resolve => {
        const startTime = Date.now();
        let lastBytesTransferred = 0;
        let lastUpdateTime = startTime;

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastUpdateTime;
            const bytesTransferred = snapshot.bytesTransferred;
            const totalBytes = snapshot.totalBytes;
            const percentage = Math.round(
              (bytesTransferred / totalBytes) * 100
            );

            // Calculate speed and time remaining
            let speed = 0;
            let timeRemaining: number | undefined;

            if (timeDiff > 1000 && bytesTransferred > lastBytesTransferred) {
              const bytesPerSecond =
                (bytesTransferred - lastBytesTransferred) / (timeDiff / 1000);
              speed = bytesPerSecond;

              if (speed > 0) {
                timeRemaining = Math.round(
                  (totalBytes - bytesTransferred) / speed
                );
              }

              lastBytesTransferred = bytesTransferred;
              lastUpdateTime = currentTime;
            }

            const progress: FileUploadProgress = {
              bytesTransferred,
              totalBytes,
              percentage,
              state: snapshot.state as FileUploadProgress['state'],
              speed,
              timeRemaining,
            };

            if (onProgress) {
              onProgress(progress);
            }
          },
          error => {
            this.uploadTasks.delete(taskId);
            this.progressCallbacks.delete(taskId);

            resolve({
              success: false,
              error: `Upload failed: ${error.message}`,
              data: undefined,
            });
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              this.uploadTasks.delete(taskId);
              this.progressCallbacks.delete(taskId);

              const result: FileUploadResult = {
                url: downloadURL,
                fileName: sanitizedFileName,
                filePath: fullPath,
                fileSize: file.size,
                mimeType: file.type,
                uploadedAt: new Date(),
                metadata: metadata.customMetadata,
              };

              resolve({
                success: true,
                data: result,
                error: undefined,
              });
            } catch (error) {
              resolve({
                success: false,
                error: `Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
                data: undefined,
              });
            }
          }
        );
      });
    } catch (error) {
      return {
        success: false,
        error: `Upload initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    path: string,
    config: FileUploadConfig = {},
    onProgress?: (fileIndex: number, progress: FileUploadProgress) => void
  ): Promise<ApiResponse<FileUploadResult[]>> {
    try {
      const results: FileUploadResult[] = [];
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await this.uploadFile(
          file,
          path,
          config,
          onProgress ? progress => onProgress(i, progress) : undefined
        );

        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`${file.name}: ${result.error}`);
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return {
          success: false,
          error: `All uploads failed: ${errors.join('; ')}`,
          data: undefined,
        };
      }

      return {
        success: true,
        data: results,
        error:
          errors.length > 0
            ? `Some uploads failed: ${errors.join('; ')}`
            : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(filePath: string): Promise<ApiResponse<boolean>> {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);

      return {
        success: true,
        data: true,
        error: undefined,
      };
    } catch (error: any) {
      // Handle case where file doesn't exist
      if (error.code === 'storage/object-not-found') {
        return {
          success: true,
          data: true,
        };
      }

      return {
        success: false,
        error: `Failed to delete file: ${error.message}`,
      };
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(
    filePaths: string[]
  ): Promise<ApiResponse<{ deleted: string[]; failed: string[] }>> {
    try {
      const deleted: string[] = [];
      const failed: string[] = [];

      await Promise.allSettled(
        filePaths.map(async filePath => {
          const result = await this.deleteFile(filePath);
          if (result.success) {
            deleted.push(filePath);
          } else {
            failed.push(filePath);
          }
        })
      );

      return {
        success: true,
        data: { deleted, failed },
        error:
          failed.length > 0
            ? `Failed to delete ${failed.length} files`
            : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Batch delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<ApiResponse<any>> {
    try {
      const fileRef = ref(storage, filePath);
      const metadata = await getMetadata(fileRef);

      return {
        success: true,
        data: metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get metadata: ${error.message}`,
      };
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    filePath: string,
    metadata: Record<string, any>
  ): Promise<ApiResponse<any>> {
    try {
      const fileRef = ref(storage, filePath);
      const updatedMetadata = await updateMetadata(fileRef, {
        customMetadata: metadata,
      });

      return {
        success: true,
        data: updatedMetadata,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to update metadata: ${error.message}`,
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string): Promise<ApiResponse<string[]>> {
    try {
      const listRef = ref(storage, path);
      const result = await listAll(listRef);

      const filePaths = result.items.map(item => item.fullPath);

      return {
        success: true,
        data: filePaths,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to list files: ${error.message}`,
      };
    }
  }

  /**
   * Cancel an ongoing upload
   */
  cancelUpload(taskId: string): boolean {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.cancel();
      this.uploadTasks.delete(taskId);
      this.progressCallbacks.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Pause an ongoing upload
   */
  pauseUpload(taskId: string): boolean {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.pause();
      return true;
    }
    return false;
  }

  /**
   * Resume a paused upload
   */
  resumeUpload(taskId: string): boolean {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.resume();
      return true;
    }
    return false;
  }

  /**
   * Get upload configuration for file type
   */
  getConfigForFileType(
    fileType: 'image' | 'video' | 'document'
  ): FileUploadConfig {
    return { ...DEFAULT_CONFIGS[fileType] };
  }

  /**
   * Get configuration for media files (images and videos)
   */
  getMediaConfig(): FileUploadConfig {
    return {
      maxFileSizeBytes: 200 * 1024 * 1024, // 200MB
      allowedMimeTypes: [
        ...DEFAULT_CONFIGS.image.allowedMimeTypes!,
        ...DEFAULT_CONFIGS.video.allowedMimeTypes!,
      ],
      allowedExtensions: [
        ...DEFAULT_CONFIGS.image.allowedExtensions!,
        ...DEFAULT_CONFIGS.video.allowedExtensions!,
      ],
      generateThumbnails: true,
      compressionQuality: 0.8,
    };
  }

  /**
   * Helper: Sanitize file name for storage
   */
  private sanitizeFileName(fileName: string): string {
    // Remove or replace invalid characters
    const sanitized = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

    // Add timestamp to prevent collisions
    const timestamp = Date.now();
    const extension = this.getFileExtension(fileName);
    const nameWithoutExt = sanitized.replace(extension, '');

    return `${nameWithoutExt}_${timestamp}${extension}`;
  }

  /**
   * Helper: Get file extension
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot) : '';
  }

  /**
   * Helper: Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
