// Test utility for Firestore internal assertion error handling
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  withFirestoreRecovery,
  isFirestoreInternalError,
  triggerAutomaticRecovery,
  cleanupAllListeners,
} from './firebase-error-handler';

export const testFirestoreRecovery = async () => {
  try {
    if (!db) {
      return false;
    }

    // Test 1: Basic query with recovery

    const testQuery = query(
      collection(db, 'projects'),
      where('status', '==', 'published')
    );

    const result = await withFirestoreRecovery(() => getDocs(testQuery), null);

    if (result) {
    } else {
    }

    // Test 2: Error detection

    const mockInternalError = new Error(
      'FIRESTORE (11.9.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: b815) CONTEXT: {"Fe":-1}'
    );
    const isInternal = isFirestoreInternalError(mockInternalError);

    // Test 3: Automatic recovery function

    const recoverySuccess = await triggerAutomaticRecovery();

    // Test 4: Listener cleanup

    cleanupAllListeners();

    // Test 5: Global error handler (skipped - function not implemented)

    // Test 6: Multiple error types detection

    const errorTypes = [
      'FIRESTORE (11.9.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)',
      'FIRESTORE (11.9.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: b815)',
      'WatchChangeAggregator error',
      'onWatchStreamChange error',
      'Target ID conflict',
      'CONTEXT: {"Fe":-1}',
    ];

    let detectionCount = 0;
    errorTypes.forEach(errorMessage => {
      const mockError = new Error(errorMessage);
      if (isFirestoreInternalError(mockError)) {
        detectionCount++;
      }
    });

    // Test 7: Recovery attempt limits

    let consecutiveRecoveryAttempts = 0;
    for (let i = 0; i < 5; i++) {
      const attempt = await triggerAutomaticRecovery();
      if (attempt) {
        consecutiveRecoveryAttempts++;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Test specific error scenarios
export const testSpecificErrorScenarios = async () => {
  const scenarios = [
    {
      name: 'Network connectivity issues',
      error: new Error('Failed to fetch'),
      shouldRecover: false,
    },
    {
      name: 'Firestore internal assertion',
      error: new Error(
        'FIRESTORE (11.9.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: b815)'
      ),
      shouldRecover: true,
    },
    {
      name: 'Permission denied',
      error: new Error('Missing or insufficient permissions'),
      shouldRecover: false,
    },
    {
      name: 'Target ID conflict',
      error: new Error('Target ID b815 already exists'),
      shouldRecover: true,
    },
  ];

  let passedTests = 0;

  for (const scenario of scenarios) {
    const shouldRecover = isFirestoreInternalError(scenario.error);
    const testPassed = shouldRecover === scenario.shouldRecover;

    if (testPassed) {
      passedTests++;
    }
  }

  return passedTests === scenarios.length;
};

// Performance test for recovery system
export const testRecoveryPerformance = async () => {
  const startTime = Date.now();

  try {
    // Simulate multiple rapid error conditions
    const promises = Array.from({ length: 10 }, (_, i) =>
      triggerAutomaticRecovery().then(success => ({ index: i, success }))
    );

    const results = await Promise.all(promises);
    const successfulRecoveries = results.filter(r => r.success).length;

    const endTime = Date.now();
    const duration = endTime - startTime;

    return duration < 30000; // Should complete within 30 seconds
  } catch (error) {
    return false;
  }
};

// Export all test functions
export const runAllFirestoreRecoveryTests = async () => {
  const tests = [
    { name: 'Basic Recovery', fn: testFirestoreRecovery },
    { name: 'Error Scenarios', fn: testSpecificErrorScenarios },
    { name: 'Performance', fn: testRecoveryPerformance },
  ];

  let passedTests = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      } else {
      }
    } catch (error) {}
  }

  return passedTests === tests.length;
};

// Export for use in development
export const runFirestoreRecoveryTest = () => {
  if (typeof window !== 'undefined') {
    // Only run in browser
    testFirestoreRecovery().then(success => {
      if (success) {
      } else {
      }
    });
  }
};
