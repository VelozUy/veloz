import {
  analyzeThemePerformance,
  generateThemePerformanceReport,
  isThemeOptimized,
  getThemeSwitchingMetrics,
} from '../theme-performance';

describe('Theme Performance Tests', () => {
  test('should analyze theme performance correctly', () => {
    const analysis = analyzeThemePerformance();

    expect(analysis).toHaveProperty('cssVariables');
    expect(analysis).toHaveProperty('colorDefinitions');
    expect(analysis).toHaveProperty('shadowDefinitions');
    expect(analysis).toHaveProperty('fontDefinitions');
    expect(analysis).toHaveProperty('estimatedSize');
    expect(analysis).toHaveProperty('optimizationOpportunities');

    expect(analysis.cssVariables).toBeGreaterThan(0);
    expect(analysis.colorDefinitions).toBeGreaterThan(0);
    expect(analysis.shadowDefinitions).toBeGreaterThan(0);
    expect(analysis.fontDefinitions).toBeGreaterThan(0);
    expect(analysis.optimizationOpportunities).toBeInstanceOf(Array);
  });

  test('should generate performance report', () => {
    const report = generateThemePerformanceReport();

    expect(report).toContain('Theme Performance Report for Veloz Theme');
    expect(report).toContain('Bundle Size Analysis');
    expect(report).toContain('Optimization Opportunities');
    expect(report).toContain('Performance Recommendations');
  });

  test('should identify theme as optimized', () => {
    const isOptimized = isThemeOptimized();
    expect(isOptimized).toBe(true);
  });

  test('should provide theme switching metrics', () => {
    const metrics = getThemeSwitchingMetrics();

    expect(metrics).toHaveProperty('switchingTime');
    expect(metrics).toHaveProperty('memoryUsage');
    expect(metrics).toHaveProperty('isEfficient');

    expect(metrics.switchingTime).toBe('< 1ms');
    expect(metrics.memoryUsage).toBe('Minimal');
    expect(metrics.isEfficient).toBe(true);
  });

  test('should have reasonable performance characteristics', () => {
    const analysis = analyzeThemePerformance();

    // Check that theme system is lightweight
    expect(analysis.cssVariables).toBeLessThanOrEqual(50);
    expect(analysis.colorDefinitions).toBeLessThanOrEqual(25);
    expect(analysis.shadowDefinitions).toBeLessThanOrEqual(10);

    // Check that optimization opportunities are identified
    expect(analysis.optimizationOpportunities.length).toBeGreaterThan(0);
  });
});
