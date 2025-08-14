'use client';

import { useEffect } from 'react';
import { initializeLCPOptimizations } from '@/lib/lcp-optimization';
import { initializeTBTOptimizations } from '@/lib/tbt-optimization';

/**
 * Performance Optimizer Component
 * 
 * Initializes all performance optimizations for LCP and TBT improvements
 * Based on Lighthouse report analysis
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Initialize LCP optimizations
    initializeLCPOptimizations();
    
    // Initialize TBT optimizations
    initializeTBTOptimizations();
    
    // Add to window for global access
    if (typeof window !== 'undefined') {
      (window as any).initializeTBTOptimizations = initializeTBTOptimizations;
      (window as any).initializeLCPOptimizations = initializeLCPOptimizations;
    }
  }, []);

  return null; // This component doesn't render anything
}
