'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  X,
  File,
  Image,
  Video,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUploadService } from '@/services/file-upload';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFilesRemoved: (fileIds: string[]) => void;
  selectedFiles: FileUploadItem[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

const fileUploadService = new FileUploadService();

export default function FileUpload({
  onFilesSelected,
  onFilesRemoved,
  selectedFiles,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  className,
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (disabled) return;

    // Validate file count
    if (selectedFiles.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(
          `${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`
        );
        return;
      }

      // Check file type
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push(`${file.name} is not an allowed file type.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const removeFile = (fileId: string) => {
    onFilesRemoved([fileId]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <Upload className="w-4 h-4" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium text-foreground">Click to upload</span>{' '}
            or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            {allowedTypes.includes('image/*') && 'Images, '}
            {allowedTypes.includes('application/pdf') && 'PDFs, '}
            {allowedTypes.includes('application/msword') && 'Word documents'}
            {allowedTypes.includes(
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) && ', Word documents'}
            {allowedTypes.includes('video/*') && ', Videos'}
            {` (max ${maxFileSize / (1024 * 1024)}MB each, up to ${maxFiles} files)`}
          </div>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Choose Files
        </Button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Files</Label>
          <div className="space-y-2">
            {selectedFiles.map(fileItem => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(fileItem.file)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {fileItem.file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(fileItem.file.size)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(fileItem.status)}
                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="w-20" />
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileItem.id)}
                  disabled={disabled}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {selectedFiles.some(f => f.status === 'error') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some files failed to upload. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
