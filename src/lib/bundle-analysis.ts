// Bundle Analysis Utility
// Monitors JavaScript bundle sizes and identifies optimization opportunities

export interface BundleInfo {
  name: string;
  size: number; // Size in bytes
  type: 'script' | 'chunk' | 'module';
  url: string;
  loadTime: number; // Load time in milliseconds
}

export interface BundleAnalysis {
  totalSize: number;
  totalScripts: number;
  largestBundles: BundleInfo[];
  slowestBundles: BundleInfo[];
  optimizationOpportunities: string[];
  recommendations: string[];
}

export interface BundleOptimization {
  type: 'code-splitting' | 'tree-shaking' | 'compression' | 'caching' | 'lazy-loading';
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSavings: number; // Estimated size reduction in KB
}

export class BundleAnalyzer {
  private static readonly SIZE_THRESHOLDS = {
    SMALL: 50 * 1024,    // 50KB
    MEDIUM: 200 * 1024,  // 200KB
    LARGE: 500 * 1024,   // 500KB
    HUGE: 1024 * 1024,   // 1MB
  };

  private static readonly LOAD_TIME_THRESHOLDS = {
    FAST: 100,    // 100ms
    MEDIUM: 500,  // 500ms
    SLOW: 1000,   // 1 second
    VERY_SLOW: 2000, // 2 seconds
  };

  /**
   * Analyze current page bundle performance
   */
  static analyzeBundles(): BundleAnalysis {
    if (typeof window === 'undefined') {
      return {
        totalSize: 0,
        totalScripts: 0,
        largestBundles: [],
        slowestBundles: [],
        optimizationOpportunities: [],
        recommendations: [],
      };
    }

    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter(resource => 
      resource.name.includes('.js') || 
      resource.name.includes('chunk') ||
      resource.name.includes('bundle')
    );

    const bundleInfos: BundleInfo[] = scripts.map(script => ({
      name: this.getBundleName(script.name),
      size: (script as any).transferSize || 0,
      type: this.getBundleType(script.name),
      url: script.name,
      loadTime: script.duration,
    }));

    const totalSize = bundleInfos.reduce((sum, bundle) => sum + bundle.size, 0);
    const largestBundles = [...bundleInfos]
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);
    
    const slowestBundles = [...bundleInfos]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);

    const optimizationOpportunities = this.identifyOptimizationOpportunities(bundleInfos);
    const recommendations = this.generateRecommendations(bundleInfos, totalSize);

    return {
      totalSize,
      totalScripts: bundleInfos.length,
      largestBundles,
      slowestBundles,
      optimizationOpportunities,
      recommendations,
    };
  }

  /**
   * Get bundle name from URL
   */
  private static getBundleName(url: string): string {
    const filename = url.split('/').pop() || '';
    return filename.split('?')[0]; // Remove query parameters
  }

  /**
   * Determine bundle type
   */
  private static getBundleType(url: string): BundleInfo['type'] {
    if (url.includes('chunk')) return 'chunk';
    if (url.includes('module')) return 'module';
    return 'script';
  }

  /**
   * Identify optimization opportunities
   */
  private static identifyOptimizationOpportunities(bundles: BundleInfo[]): string[] {
    const opportunities: string[] = [];

    // Check for large bundles
    const largeBundles = bundles.filter(bundle => bundle.size > this.SIZE_THRESHOLDS.LARGE);
    if (largeBundles.length > 0) {
      opportunities.push(`${largeBundles.length} bundle(s) exceed 500KB - consider code splitting`);
    }

    // Check for slow-loading bundles
    const slowBundles = bundles.filter(bundle => bundle.loadTime > this.LOAD_TIME_THRESHOLDS.SLOW);
    if (slowBundles.length > 0) {
      opportunities.push(`${slowBundles.length} bundle(s) take over 1 second to load`);
    }

    // Check for too many small bundles
    const smallBundles = bundles.filter(bundle => bundle.size < this.SIZE_THRESHOLDS.SMALL);
    if (smallBundles.length > 10) {
      opportunities.push('Too many small bundles - consider bundling for better caching');
    }

    // Check for duplicate bundles
    const bundleNames = bundles.map(b => b.name);
    const duplicates = bundleNames.filter((name, index) => bundleNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      opportunities.push('Duplicate bundle names detected - check for redundant code');
    }

    return opportunities;
  }

  /**
   * Generate optimization recommendations
   */
  private static generateRecommendations(bundles: BundleInfo[], totalSize: number): string[] {
    const recommendations: string[] = [];

    // Size-based recommendations
    if (totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Total bundle size exceeds 1MB - implement aggressive code splitting');
    } else if (totalSize > 500 * 1024) { // > 500KB
      recommendations.push('Bundle size is large - consider lazy loading and code splitting');
    }

    // Performance-based recommendations
    const avgLoadTime = bundles.reduce((sum, b) => sum + b.loadTime, 0) / bundles.length;
    if (avgLoadTime > this.LOAD_TIME_THRESHOLDS.SLOW) {
      recommendations.push('Average bundle load time is slow - optimize network requests');
    }

    // Structure-based recommendations
    if (bundles.length > 20) {
      recommendations.push('Too many bundles - consolidate for better caching');
    } else if (bundles.length < 3) {
      recommendations.push('Consider code splitting for better loading performance');
    }

    return recommendations;
  }

  /**
   * Get bundle optimization strategies
   */
  static getOptimizationStrategies(bundles: BundleInfo[]): BundleOptimization[] {
    const strategies: BundleOptimization[] = [];

    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
    const largeBundles = bundles.filter(b => b.size > this.SIZE_THRESHOLDS.MEDIUM);

    if (largeBundles.length > 0) {
      strategies.push({
        type: 'code-splitting',
        description: 'Split large bundles into smaller, more manageable chunks',
        impact: 'high',
        estimatedSavings: Math.min(totalSize * 0.3 / 1024, 200), // Up to 30% reduction
      });
    }

    if (bundles.length > 10) {
      strategies.push({
        type: 'tree-shaking',
        description: 'Remove unused code from bundles',
        impact: 'medium',
        estimatedSavings: Math.min(totalSize * 0.15 / 1024, 100), // Up to 15% reduction
      });
    }

    if (totalSize > 500 * 1024) {
      strategies.push({
        type: 'compression',
        description: 'Enable gzip/brotli compression for JavaScript bundles',
        impact: 'high',
        estimatedSavings: Math.min(totalSize * 0.7 / 1024, 300), // Up to 70% reduction
      });
    }

    const slowBundles = bundles.filter(b => b.loadTime > this.LOAD_TIME_THRESHOLDS.MEDIUM);
    if (slowBundles.length > 0) {
      strategies.push({
        type: 'lazy-loading',
        description: 'Implement lazy loading for non-critical bundles',
        impact: 'medium',
        estimatedSavings: 50, // Improved perceived performance
      });
    }

    return strategies;
  }

  /**
   * Calculate bundle efficiency score
   */
  static calculateEfficiencyScore(bundles: BundleInfo[]): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: string[];
  } {
    let score = 100;
    const factors: string[] = [];

    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
    const avgLoadTime = bundles.reduce((sum, b) => sum + b.loadTime, 0) / bundles.length;

    // Size factor (40% weight)
    if (totalSize > 1024 * 1024) {
      score -= 40;
      factors.push('Bundle size exceeds 1MB');
    } else if (totalSize > 500 * 1024) {
      score -= 20;
      factors.push('Bundle size is large');
    }

    // Load time factor (30% weight)
    if (avgLoadTime > this.LOAD_TIME_THRESHOLDS.VERY_SLOW) {
      score -= 30;
      factors.push('Very slow bundle loading');
    } else if (avgLoadTime > this.LOAD_TIME_THRESHOLDS.SLOW) {
      score -= 15;
      factors.push('Slow bundle loading');
    }

    // Bundle count factor (20% weight)
    if (bundles.length > 20) {
      score -= 20;
      factors.push('Too many bundles');
    } else if (bundles.length < 3) {
      score -= 10;
      factors.push('Insufficient code splitting');
    }

    // Bundle size distribution factor (10% weight)
    const largeBundles = bundles.filter(b => b.size > this.SIZE_THRESHOLDS.LARGE);
    if (largeBundles.length > 2) {
      score -= 10;
      factors.push('Multiple large bundles');
    }

    score = Math.max(0, score);

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { score, grade, factors };
  }

  /**
   * Get bundle loading timeline
   */
  static getBundleTimeline(): Array<{
    name: string;
    startTime: number;
    duration: number;
    size: number;
  }> {
    if (typeof window === 'undefined') return [];

    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter(resource => 
      resource.name.includes('.js') || 
      resource.name.includes('chunk') ||
      resource.name.includes('bundle')
    );

    return scripts.map(script => ({
      name: this.getBundleName(script.name),
      startTime: script.startTime,
      duration: script.duration,
      size: (script as any).transferSize || 0,
    })).sort((a, b) => a.startTime - b.startTime);
  }
}

/**
 * React hook for bundle analysis
 */
export function useBundleAnalysis() {
  const analyze = () => {
    return BundleAnalyzer.analyzeBundles();
  };

  const getOptimizationStrategies = (bundles: BundleInfo[]) => {
    return BundleAnalyzer.getOptimizationStrategies(bundles);
  };

  const getEfficiencyScore = (bundles: BundleInfo[]) => {
    return BundleAnalyzer.calculateEfficiencyScore(bundles);
  };

  const getTimeline = () => {
    return BundleAnalyzer.getBundleTimeline();
  };

  return {
    analyze,
    getOptimizationStrategies,
    getEfficiencyScore,
    getTimeline,
  };
} 