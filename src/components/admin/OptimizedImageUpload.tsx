import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import useImageOptimization from '@/hooks/useImageOptimization';
import { OptimizedImage } from '@/components/shared';

interface OptimizedImageUploadProps {
  onImageOptimized?: (result: any) => void;
  path?: string;
  className?: string;
}

/**
 * Optimized Image Upload Component
 *
 * Demonstrates production-ready image optimization:
 * - Automatic WebP conversion
 * - Responsive image generation
 * - Progress tracking
 * - Optimization statistics
 * - Preview with optimized image
 */
export default function OptimizedImageUpload({
  onImageOptimized,
  path = 'uploads/optimized',
  className = '',
}: OptimizedImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    state,
    optimizeImage,
    optimizeImageClient,
    reset,
    getOptimizationStats,
  } = useImageOptimization();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state
    reset();

    // For production use, use optimizeImage (uploads to Firebase)
    // For client-side only, use optimizeImageClient
    const result = await optimizeImage(file, path);

    if (result && onImageOptimized) {
      onImageOptimized(result);
    }
  };

  const handleClientOptimization = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    reset();
    await optimizeImageClient(file);
  };

  const stats = getOptimizationStats();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Optimized Image Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={state.isOptimizing}
            className="flex-1"
          >
            {state.isOptimizing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {state.isOptimizing ? 'Optimizing...' : 'Upload & Optimize'}
          </Button>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={state.isOptimizing}
          >
            Client Only
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Progress Indicator */}
        {state.isOptimizing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{state.message}</span>
              <span>{state.progress}%</span>
            </div>
            <Progress value={state.progress} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive/80 text-sm">{state.error}</span>
          </div>
        )}

        {/* Success Display */}
        {state.result && !state.isOptimizing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm">
                Image optimized successfully!
              </span>
            </div>

            {/* Optimization Statistics */}
            {stats && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-lg font-semibold text-primary">
                    {stats.sizeReductionPercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-primary/70">Size Reduction</div>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-lg font-semibold text-primary">
                    {(stats.bandwidthSaved / 1024).toFixed(1)}KB
                  </div>
                  <div className="text-xs text-primary/70">Bandwidth Saved</div>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-lg font-semibold text-primary">
                    {stats.sizeReduction.toFixed(0)}B
                  </div>
                  <div className="text-xs text-primary/70">Bytes Saved</div>
                </div>
              </div>
            )}

            {/* Image Preview */}
            <div className="space-y-2">
              <h4 className="font-medium">Optimized Image Preview:</h4>
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                <OptimizedImage
                  src={state.result.optimizedUrl}
                  alt="Optimized image preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Image Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Format:</span>{' '}
                  {state.result.metadata.format}
                </div>
                <div>
                  <span className="font-medium">Dimensions:</span>{' '}
                  {state.result.metadata.width} × {state.result.metadata.height}
                </div>
                <div>
                  <span className="font-medium">Original Size:</span>{' '}
                  {(state.result.metadata.originalSize / 1024).toFixed(1)}KB
                </div>
                <div>
                  <span className="font-medium">Optimized Size:</span>{' '}
                  {(state.result.metadata.optimizedSize / 1024).toFixed(1)}KB
                </div>
              </div>

              {/* Responsive URLs */}
              {state.result.responsiveUrls &&
                Object.keys(state.result.responsiveUrls).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Responsive Versions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(state.result.responsiveUrls).map(
                        ([size, url]) => (
                          <Badge key={size} variant="secondary">
                            {size}px
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={reset} className="w-full">
              Upload Another Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
