// Performance Budget Utility
// Monitors and enforces performance targets for Core Web Vitals and other metrics

export interface PerformanceBudget {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  ttfb: number; // Time to First Byte (ms)
  bundleSize: number; // JavaScript bundle size (KB)
  imageSize: number; // Total image size (KB)
}

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  bundleSize?: number;
  imageSize?: number;
}

export interface BudgetViolation {
  metric: keyof PerformanceBudget;
  target: number;
  actual: number;
  severity: 'warning' | 'critical';
  impact: string;
}

export class PerformanceBudgets {
  // Default performance budgets based on industry standards
  private static readonly DEFAULT_BUDGETS: PerformanceBudget = {
    fcp: 1500, // 1.5 seconds
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1 score
    ttfb: 800, // 800ms
    bundleSize: 500, // 500KB
    imageSize: 1000, // 1MB
  };

  // Warning thresholds (80% of budget)
  private static readonly WARNING_THRESHOLDS: PerformanceBudget = {
    fcp: 1200, // 1.2 seconds
    lcp: 2000, // 2.0 seconds
    fid: 80,   // 80ms
    cls: 0.08, // 0.08 score
    ttfb: 640, // 640ms
    bundleSize: 400, // 400KB
    imageSize: 800,  // 800KB
  };

  /**
   * Check if metrics meet performance budgets
   */
  static checkBudgets(
    metrics: PerformanceMetrics,
    customBudgets?: Partial<PerformanceBudget>
  ): BudgetViolation[] {
    const budgets = { ...this.DEFAULT_BUDGETS, ...customBudgets };
    const violations: BudgetViolation[] = [];

    for (const [metric, target] of Object.entries(budgets)) {
      const actual = metrics[metric as keyof PerformanceMetrics];
      if (actual === undefined) continue;

      const warningThreshold = this.WARNING_THRESHOLDS[metric as keyof PerformanceBudget];
      
      if (actual > target) {
        violations.push({
          metric: metric as keyof PerformanceBudget,
          target,
          actual,
          severity: 'critical',
          impact: this.getImpactDescription(metric as keyof PerformanceBudget, actual, target),
        });
      } else if (actual > warningThreshold) {
        violations.push({
          metric: metric as keyof PerformanceBudget,
          target,
          actual,
          severity: 'warning',
          impact: this.getImpactDescription(metric as keyof PerformanceBudget, actual, target),
        });
      }
    }

    return violations;
  }

  /**
   * Get impact description for budget violations
   */
  private static getImpactDescription(
    metric: keyof PerformanceBudget,
    actual: number,
    target: number
  ): string {
    const percentage = Math.round((actual / target) * 100);
    
    switch (metric) {
      case 'fcp':
        return `First Contentful Paint is ${percentage}% of budget (${actual}ms vs ${target}ms target). This affects perceived loading speed.`;
      case 'lcp':
        return `Largest Contentful Paint is ${percentage}% of budget (${actual}ms vs ${target}ms target). This affects user experience and SEO.`;
      case 'fid':
        return `First Input Delay is ${percentage}% of budget (${actual}ms vs ${target}ms target). This affects interactivity.`;
      case 'cls':
        return `Cumulative Layout Shift is ${percentage}% of budget (${actual} vs ${target} target). This affects visual stability.`;
      case 'ttfb':
        return `Time to First Byte is ${percentage}% of budget (${actual}ms vs ${target}ms target). This affects server response time.`;
      case 'bundleSize':
        return `JavaScript bundle size is ${percentage}% of budget (${actual}KB vs ${target}KB target). This affects download time.`;
      case 'imageSize':
        return `Total image size is ${percentage}% of budget (${actual}KB vs ${target}KB target). This affects loading performance.`;
      default:
        return `Performance metric ${metric} exceeds budget by ${percentage}%.`;
    }
  }

  /**
   * Get performance grade based on metrics
   */
  static getPerformanceGrade(metrics: PerformanceMetrics): {
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    score: number;
    description: string;
  } {
    const violations = this.checkBudgets(metrics);
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const warningViolations = violations.filter(v => v.severity === 'warning').length;
    
    let score = 100;
    score -= criticalViolations * 20; // -20 points per critical violation
    score -= warningViolations * 5;   // -5 points per warning violation
    
    score = Math.max(0, score);

    if (score >= 90) return { grade: 'A', score, description: 'Excellent performance' };
    if (score >= 80) return { grade: 'B', score, description: 'Good performance' };
    if (score >= 70) return { grade: 'C', score, description: 'Average performance' };
    if (score >= 60) return { grade: 'D', score, description: 'Below average performance' };
    return { grade: 'F', score, description: 'Poor performance' };
  }

  /**
   * Get optimization recommendations
   */
  static getOptimizationRecommendations(violations: BudgetViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.metric) {
        case 'fcp':
          recommendations.push('Optimize critical rendering path, reduce render-blocking resources');
          break;
        case 'lcp':
          recommendations.push('Optimize largest contentful paint element, improve image loading');
          break;
        case 'fid':
          recommendations.push('Reduce JavaScript execution time, split long tasks');
          break;
        case 'cls':
          recommendations.push('Set explicit dimensions for images and videos, avoid layout shifts');
          break;
        case 'ttfb':
          recommendations.push('Optimize server response time, improve database queries');
          break;
        case 'bundleSize':
          recommendations.push('Code splitting, tree shaking, remove unused dependencies');
          break;
        case 'imageSize':
          recommendations.push('Optimize images, use modern formats (WebP/AVIF), lazy loading');
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Calculate bundle size from performance entries
   */
  static calculateBundleSize(): number {
    if (typeof window === 'undefined') return 0;

    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') || resource.name.includes('chunk')
    );

    return jsResources.reduce((total, resource) => {
      // Estimate size based on transfer size or duration
      const size = (resource as any).transferSize || (resource.duration * 1000);
      return total + size;
    }, 0) / 1024; // Convert to KB
  }

  /**
   * Calculate total image size from performance entries
   */
  static calculateImageSize(): number {
    if (typeof window === 'undefined') return 0;

    const resources = performance.getEntriesByType('resource');
    const imageResources = resources.filter(resource => 
      resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)
    );

    return imageResources.reduce((total, resource) => {
      const size = (resource as any).transferSize || (resource.duration * 1000);
      return total + size;
    }, 0) / 1024; // Convert to KB
  }

  /**
   * Get comprehensive performance report
   */
  static generatePerformanceReport(metrics: PerformanceMetrics): {
    grade: { grade: 'A' | 'B' | 'C' | 'D' | 'F'; score: number; description: string };
    violations: BudgetViolation[];
    recommendations: string[];
    summary: string;
  } {
    const violations = this.checkBudgets(metrics);
    const grade = this.getPerformanceGrade(metrics);
    const recommendations = this.getOptimizationRecommendations(violations);

    const summary = violations.length === 0 
      ? 'All performance metrics are within budget targets.'
      : `${violations.length} performance issue${violations.length === 1 ? '' : 's'} detected.`;

    return {
      grade,
      violations,
      recommendations,
      summary,
    };
  }
}

/**
 * React hook for performance budget monitoring
 */
export function usePerformanceBudget() {
  const checkMetrics = (metrics: PerformanceMetrics) => {
    return PerformanceBudgets.checkBudgets(metrics);
  };

  const getGrade = (metrics: PerformanceMetrics) => {
    return PerformanceBudgets.getPerformanceGrade(metrics);
  };

  const getRecommendations = (violations: BudgetViolation[]) => {
    return PerformanceBudgets.getOptimizationRecommendations(violations);
  };

  const generateReport = (metrics: PerformanceMetrics) => {
    return PerformanceBudgets.generatePerformanceReport(metrics);
  };

  return {
    checkMetrics,
    getGrade,
    getRecommendations,
    generateReport,
  };
} 