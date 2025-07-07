'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getErrorStatistics,
  triggerAutomaticRecovery,
  cleanupAllListeners,
} from '@/lib/firebase-error-handler';
import { runAllFirestoreRecoveryTests } from '@/lib/test-firestore-recovery';
import { testFirebaseConnection } from '@/lib/firebase-test';

interface ErrorStatistics {
  totalErrors: number;
  recentErrors: number;
  dailyErrors: number;
  errorTypes: {
    internal: number;
    network: number;
    permission: number;
    other: number;
  };
  lastError?: {
    timestamp: Date;
    error: string;
    errorType: string;
    recoveryAttempted: boolean;
    recoverySuccessful: boolean;
    operation?: string;
  };
}

interface TestResults {
  success?: boolean;
  message: string;
  loading?: boolean;
}

export default function FirebaseDebugPage() {
  const [stats, setStats] = useState<ErrorStatistics | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(
    null
  );

  const refreshStats = () => {
    setStats(getErrorStatistics());
  };

  const triggerRecovery = async () => {
    setIsRecovering(true);
    try {
      const success = await triggerAutomaticRecovery();
      setTestResults({
        success,
        message: success ? 'Recovery successful' : 'Recovery failed',
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: `Recovery error: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setIsRecovering(false);
      refreshStats();
    }
  };

  const runTests = async () => {
    setTestResults({ loading: true, message: 'Running tests...' });
    try {
      const success = await runAllFirestoreRecoveryTests();
      setTestResults({
        success,
        message: success ? 'All tests passed' : 'Some tests failed',
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: `Test error: ${error instanceof Error ? error.message : error}`,
      });
    }
  };

  const testConnection = async () => {
    try {
      const success = await testFirebaseConnection();
      setConnectionStatus(success);
    } catch {
      setConnectionStatus(false);
    }
  };

  const cleanupListeners = () => {
    cleanupAllListeners();
    refreshStats();
  };

  useEffect(() => {
    refreshStats();
    testConnection();

    // Refresh stats every 5 seconds
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Firebase Debug & Monitoring</h1>
        <div className="flex gap-2">
          <Button onClick={refreshStats} variant="outline">
            Refresh Stats
          </Button>
          <Button onClick={testConnection} variant="outline">
            Test Connection
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Current Firebase connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                connectionStatus === true
                  ? 'default'
                  : connectionStatus === false
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {connectionStatus === true
                ? 'Connected'
                : connectionStatus === false
                  ? 'Disconnected'
                  : 'Unknown'}
            </Badge>
            {connectionStatus !== null && (
              <span className="text-sm text-muted-foreground">
                {connectionStatus
                  ? 'Firebase is working correctly'
                  : 'Firebase connection issues detected'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Error Statistics</CardTitle>
          <CardDescription>
            Firebase error tracking and recovery metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalErrors}</div>
                <div className="text-sm text-muted-foreground">
                  Total Errors
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.recentErrors}</div>
                <div className="text-sm text-muted-foreground">Last Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.dailyErrors}</div>
                <div className="text-sm text-muted-foreground">
                  Last 24 Hours
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.errorTypes.internal +
                    stats.errorTypes.network +
                    stats.errorTypes.permission}
                </div>
                <div className="text-sm text-muted-foreground">
                  Recoverable Errors
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No error data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Types Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Error Types</CardTitle>
            <CardDescription>
              Breakdown of error types in the last hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">
                  {stats.errorTypes.internal}
                </div>
                <div className="text-sm text-muted-foreground">
                  Internal Assertion
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {stats.errorTypes.network}
                </div>
                <div className="text-sm text-muted-foreground">Network</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {stats.errorTypes.permission}
                </div>
                <div className="text-sm text-muted-foreground">Permission</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">
                  {stats.errorTypes.other}
                </div>
                <div className="text-sm text-muted-foreground">Other</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Error */}
      {stats?.lastError && (
        <Card>
          <CardHeader>
            <CardTitle>Last Error</CardTitle>
            <CardDescription>Most recent Firebase error</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    stats.lastError.recoverySuccessful
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {stats.lastError.recoverySuccessful ? 'Recovered' : 'Failed'}
                </Badge>
                <Badge variant="outline">{stats.lastError.errorType}</Badge>
                <span className="text-sm text-muted-foreground">
                  {stats.lastError.timestamp.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-mono bg-muted p-2 rounded">
                {stats.lastError.error}
              </div>
              {stats.lastError.operation && (
                <div className="text-sm text-muted-foreground">
                  Operation: {stats.lastError.operation}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Actions</CardTitle>
          <CardDescription>Manual recovery and testing tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={triggerRecovery}
              disabled={isRecovering}
              variant="destructive"
            >
              {isRecovering ? 'Recovering...' : 'Trigger Recovery'}
            </Button>
            <Button onClick={cleanupListeners} variant="outline">
              Cleanup Listeners
            </Button>
            <Button onClick={runTests} variant="outline">
              Run Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Alert variant={testResults.success ? 'default' : 'destructive'}>
          <AlertDescription>
            {testResults.message}
            {testResults.loading && ' (Loading...)'}
          </AlertDescription>
        </Alert>
      )}

      {/* Recovery Status */}
      {isRecovering && (
        <Alert>
          <AlertDescription>
            🔄 Automatic recovery in progress... This may take a few seconds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
