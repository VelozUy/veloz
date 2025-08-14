import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet, supportsWebP } from '@/lib/image-optimization';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'empty' | 'blur';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fill = false,
  loading,
  style,
}: OptimizedImageProps) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [srcSet, setSrcSet] = useState<string>('');
  const [webpSupported, setWebpSupported] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // Check WebP support
    setWebpSupported(supportsWebP());
  }, []);

  useEffect(() => {
    if (!src) return;

    // Get optimized URL
    const optimized = getOptimizedImageUrl(src);
    setOptimizedSrc(optimized);

    // Generate srcSet for responsive images
    const responsiveSrcSet = generateSrcSet(src);
    setSrcSet(responsiveSrcSet);

    // Reset error state when src changes
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    // Fallback to original image if optimized version fails
    if (optimizedSrc !== src) {
      setOptimizedSrc(src);
      setSrcSet('');
    }
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  // If WebP is not supported, use original image
  const finalSrc = webpSupported ? optimizedSrc : src;
  const finalSrcSet = webpSupported ? srcSet : '';

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={handleLoad}
      onError={handleError}
      fill={fill}
      loading={loading || (priority ? 'eager' : 'lazy')}
      style={style}
    />
  );
}

export default OptimizedImage;
