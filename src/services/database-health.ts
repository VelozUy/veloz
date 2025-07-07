import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreService } from '@/lib/firebase';
import { withRetry, createErrorResponse } from '@/lib/firebase-error-handler';
import type { ApiResponse } from '@/types';

// Health check configuration
interface HealthCheckConfig {
  timeout: number; // Timeout in milliseconds
  testCollection: string; // Collection to use for health checks
  testDocId: string; // Document ID for health check
  retryAttempts: number;
}

// Health status types
export type DatabaseStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface DatabaseHealthInfo {
  status: DatabaseStatus;
  latency: number; // Response time in milliseconds
  lastCheck: Date;
  connectivity: boolean;
  readTest: boolean;
  writeTest: boolean;
  errors: string[];
  warnings: string[];
  uptime?: number; // Time since last successful connection
}

// Default configuration
const DEFAULT_CONFIG: HealthCheckConfig = {
  timeout: 10000, // 10 seconds
  testCollection: '_health_checks',
  testDocId: 'connectivity_test',
  retryAttempts: 2,
};

/**
 * Database Health Monitoring Service
 * Provides comprehensive database connectivity and performance monitoring
 */
export class DatabaseHealthService {
  private static instance: DatabaseHealthService;
  private config: HealthCheckConfig;
  private lastHealthInfo: DatabaseHealthInfo | null = null;
  private healthHistory: DatabaseHealthInfo[] = [];
  private maxHistorySize = 50;
  private isChecking = false;
  private lastSuccessfulConnection: Date | null = null;

  private constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(
    config?: Partial<HealthCheckConfig>
  ): DatabaseHealthService {
    if (!DatabaseHealthService.instance) {
      DatabaseHealthService.instance = new DatabaseHealthService(config);
    }
    return DatabaseHealthService.instance;
  }

  /**
   * Perform comprehensive database health check
   */
  async checkHealth(): Promise<ApiResponse<DatabaseHealthInfo>> {
    if (this.isChecking) {
      return {
        success: true,
        data: this.lastHealthInfo || this.createDefaultHealthInfo(),
        error: undefined,
      };
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const healthInfo: DatabaseHealthInfo = {
        status: 'unknown',
        latency: 0,
        lastCheck: new Date(),
        connectivity: false,
        readTest: false,
        writeTest: false,
        errors: [],
        warnings: [],
      };

      // Test basic connectivity
      const connectivityResult = await this.testConnectivity();
      healthInfo.connectivity = connectivityResult.success;
      if (!connectivityResult.success) {
        healthInfo.errors.push(
          connectivityResult.error || 'Database connectivity failed'
        );
      }

      // Test read operations
      if (healthInfo.connectivity) {
        const readResult = await this.testRead();
        healthInfo.readTest = readResult.success;
        if (!readResult.success) {
          healthInfo.errors.push(
            readResult.error || 'Database read test failed'
          );
        }
      }

      // Test write operations
      if (healthInfo.connectivity && healthInfo.readTest) {
        const writeResult = await this.testWrite();
        healthInfo.writeTest = writeResult.success;
        if (!writeResult.success) {
          healthInfo.errors.push(
            writeResult.error || 'Database write test failed'
          );
        }
      }

      // Calculate latency
      healthInfo.latency = Date.now() - startTime;

      // Determine overall health status
      healthInfo.status = this.determineHealthStatus(healthInfo);

      // Calculate uptime if applicable
      if (healthInfo.status === 'healthy') {
        this.lastSuccessfulConnection = new Date();
      }

      if (this.lastSuccessfulConnection) {
        healthInfo.uptime =
          Date.now() - this.lastSuccessfulConnection.getTime();
      }

      // Add warnings for performance issues
      if (healthInfo.latency > 5000) {
        healthInfo.warnings.push('High latency detected (>5s)');
      } else if (healthInfo.latency > 2000) {
        healthInfo.warnings.push('Elevated latency detected (>2s)');
      }

      // Store health info
      this.lastHealthInfo = healthInfo;
      this.addToHistory(healthInfo);

      return {
        success: true,
        data: healthInfo,
        error: undefined,
      };
    } catch (error) {
      const healthInfo = this.createDefaultHealthInfo();
      healthInfo.errors.push('Health check failed completely');
      healthInfo.latency = Date.now() - startTime;
      healthInfo.status = 'unhealthy';

      this.lastHealthInfo = healthInfo;
      this.addToHistory(healthInfo);

      return createErrorResponse<DatabaseHealthInfo>(
        error,
        'database-health-check'
      );
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Test basic database connectivity
   */
  private async testConnectivity(): Promise<ApiResponse<boolean>> {
    return withRetry(
      async () => {
        const db = await getFirestoreService();
        if (!db) {
          throw new Error('Firebase Firestore not initialized');
        }
        // Simple connectivity test - try to access a system document
        const testDoc = doc(db, '_system', '_test');
        await getDoc(testDoc);

        return {
          success: true,
          data: true,
          error: undefined,
        };
      },
      {
        maxAttempts: this.config.retryAttempts,
        baseDelay: 1000,
      },
      'database-connectivity-test'
    ).catch(error =>
      createErrorResponse<boolean>(error, 'database-connectivity-test')
    );
  }

  /**
   * Test database read operations
   */
  private async testRead(): Promise<ApiResponse<boolean>> {
    return withRetry(
      async () => {
        const db = await getFirestoreService();
        if (!db) {
          throw new Error('Firebase Firestore not initialized');
        }
        const testDocRef = doc(
          db,
          this.config.testCollection,
          this.config.testDocId
        );
        await getDoc(testDocRef);

        return {
          success: true,
          data: true,
          error: undefined,
        };
      },
      {
        maxAttempts: this.config.retryAttempts,
        baseDelay: 1000,
      },
      'database-read-test'
    ).catch(error => createErrorResponse<boolean>(error, 'database-read-test'));
  }

  /**
   * Test database write operations
   */
  private async testWrite(): Promise<ApiResponse<boolean>> {
    return withRetry(
      async () => {
        const db = await getFirestoreService();
        if (!db) {
          throw new Error('Firebase Firestore not initialized');
        }
        const testDocRef = doc(
          db,
          this.config.testCollection,
          this.config.testDocId
        );

        await setDoc(
          testDocRef,
          {
            timestamp: serverTimestamp(),
            testData: `health-check-${Date.now()}`,
            success: true,
          },
          { merge: true }
        );

        return {
          success: true,
          data: true,
          error: undefined,
        };
      },
      {
        maxAttempts: this.config.retryAttempts,
        baseDelay: 1000,
      },
      'database-write-test'
    ).catch(error =>
      createErrorResponse<boolean>(error, 'database-write-test')
    );
  }

  /**
   * Determine overall health status
   */
  private determineHealthStatus(
    healthInfo: DatabaseHealthInfo
  ): DatabaseStatus {
    if (!healthInfo.connectivity) {
      return 'unhealthy';
    }

    if (!healthInfo.readTest || !healthInfo.writeTest) {
      return 'degraded';
    }

    if (healthInfo.latency > 10000 || healthInfo.errors.length > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Create default health info object
   */
  private createDefaultHealthInfo(): DatabaseHealthInfo {
    return {
      status: 'unknown',
      latency: 0,
      lastCheck: new Date(),
      connectivity: false,
      readTest: false,
      writeTest: false,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Add health info to history
   */
  private addToHistory(healthInfo: DatabaseHealthInfo): void {
    this.healthHistory.unshift(healthInfo);

    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get current health status
   */
  getCurrentHealth(): DatabaseHealthInfo | null {
    return this.lastHealthInfo;
  }

  /**
   * Get health history
   */
  getHealthHistory(limit?: number): DatabaseHealthInfo[] {
    return limit ? this.healthHistory.slice(0, limit) : [...this.healthHistory];
  }

  /**
   * Get health statistics
   */
  getHealthStats(): {
    averageLatency: number;
    uptimePercentage: number;
    errorRate: number;
    recentErrors: string[];
    statusDistribution: Record<DatabaseStatus, number>;
  } {
    if (this.healthHistory.length === 0) {
      return {
        averageLatency: 0,
        uptimePercentage: 0,
        errorRate: 0,
        recentErrors: [],
        statusDistribution: {
          healthy: 0,
          degraded: 0,
          unhealthy: 0,
          unknown: 0,
        },
      };
    }

    const totalLatency = this.healthHistory.reduce(
      (sum, info) => sum + info.latency,
      0
    );
    const averageLatency = totalLatency / this.healthHistory.length;

    const healthyCount = this.healthHistory.filter(
      info => info.status === 'healthy'
    ).length;
    const uptimePercentage = (healthyCount / this.healthHistory.length) * 100;

    const totalErrors = this.healthHistory.reduce(
      (sum, info) => sum + info.errors.length,
      0
    );
    const errorRate = (totalErrors / this.healthHistory.length) * 100;

    const recentErrors = this.healthHistory
      .slice(0, 10)
      .flatMap(info => info.errors)
      .slice(0, 5);

    const statusDistribution = this.healthHistory.reduce(
      (dist, info) => {
        dist[info.status]++;
        return dist;
      },
      { healthy: 0, degraded: 0, unhealthy: 0, unknown: 0 }
    );

    return {
      averageLatency,
      uptimePercentage,
      errorRate,
      recentErrors,
      statusDistribution,
    };
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    setInterval(async () => {
      await this.checkHealth();
    }, intervalMs);
  }

  /**
   * Check if database is currently healthy
   */
  isHealthy(): boolean {
    return this.lastHealthInfo?.status === 'healthy' || false;
  }

  /**
   * Reset health monitoring
   */
  reset(): void {
    this.lastHealthInfo = null;
    this.healthHistory = [];
    this.lastSuccessfulConnection = null;
  }
}

// Export singleton instance
export const databaseHealthService = DatabaseHealthService.getInstance();
