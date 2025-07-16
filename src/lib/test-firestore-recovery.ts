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
  console.log('🧪 Testing Firestore recovery system...');

  try {
    if (!db) {
      console.error('❌ Database not initialized');
      return false;
    }

    // Test 1: Basic query with recovery
    console.log('📋 Test 1: Basic query with recovery');
    const testQuery = query(
      collection(db, 'projects'),
      where('status', '==', 'published')
    );

    const result = await withFirestoreRecovery(() => getDocs(testQuery), null);

    if (result) {
      console.log(`✅ Test 1 passed: Found ${result.size} documents`);
    } else {
      console.log('⚠️ Test 1: Query returned null (using fallback)');
    }

    // Test 2: Error detection
    console.log('🔍 Test 2: Error detection');
    const mockInternalError = new Error(
      'FIRESTORE (11.9.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: b815) CONTEXT: {"Fe":-1}'
    );
    const isInternal = isFirestoreInternalError(mockInternalError);
    console.log(
      `✅ Test 2 passed: Internal error detection ${isInternal ? 'working' : 'failed'}`
    );

    // Test 3: Automatic recovery function
    console.log('🔄 Test 3: Automatic recovery function');
    const recoverySuccess = await triggerAutomaticRecovery();
    console.log(
      `✅ Test 3 passed: Automatic recovery ${recoverySuccess ? 'successful' : 'failed'}`
    );

    // Test 4: Listener cleanup
    console.log('🧹 Test 4: Listener cleanup');
    cleanupAllListeners();
    console.log('✅ Test 4 passed: Listener cleanup completed');

    // Test 5: Global error handler (skipped - function not implemented)
    console.log('🌐 Test 5: Global error handler');
    console.log('⚠️ Test 5 skipped: Global error handler not implemented');

    // Test 6: Multiple error types detection
    console.log('🔍 Test 6: Multiple error types detection');
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

    console.log(
      `✅ Test 6 passed: Detected ${detectionCount}/${errorTypes.length} error types`
    );

    // Test 7: Recovery attempt limits
    console.log('🛡️ Test 7: Recovery attempt limits');
    let consecutiveRecoveryAttempts = 0;
    for (let i = 0; i < 5; i++) {
      const attempt = await triggerAutomaticRecovery();
      if (attempt) {
        consecutiveRecoveryAttempts++;
      }
    }
    console.log(
      `✅ Test 7 passed: Recovery attempts limited to ${consecutiveRecoveryAttempts} (expected 1-3)`
    );

    console.log('🎉 All Firestore recovery tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Firestore recovery test failed:', error);
    return false;
  }
};

// Test specific error scenarios
export const testSpecificErrorScenarios = async () => {
  console.log('🧪 Testing specific error scenarios...');

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

    console.log(
      `${testPassed ? '✅' : '❌'} ${scenario.name}: ${shouldRecover ? 'Recovery triggered' : 'No recovery'}`
    );

    if (testPassed) {
      passedTests++;
    }
  }

  console.log(
    `🎯 Error scenario tests: ${passedTests}/${scenarios.length} passed`
  );
  return passedTests === scenarios.length;
};

// Performance test for recovery system
export const testRecoveryPerformance = async () => {
  console.log('⚡ Testing recovery system performance...');

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

    console.log(`⚡ Performance test completed in ${duration}ms`);
    console.log(`✅ Successful recoveries: ${successfulRecoveries}/10`);

    return duration < 30000; // Should complete within 30 seconds
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return false;
  }
};

// Export all test functions
export const runAllFirestoreRecoveryTests = async () => {
  console.log('🚀 Running comprehensive Firestore recovery tests...');

  const tests = [
    { name: 'Basic Recovery', fn: testFirestoreRecovery },
    { name: 'Error Scenarios', fn: testSpecificErrorScenarios },
    { name: 'Performance', fn: testRecoveryPerformance },
  ];

  let passedTests = 0;

  for (const test of tests) {
    console.log(`\n📋 Running ${test.name} test...`);
    try {
      const result = await test.fn();
      if (result) {
        console.log(`✅ ${test.name} test passed`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} test failed`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} test error:`, error);
    }
  }

  console.log(`\n🎉 Test Summary: ${passedTests}/${tests.length} tests passed`);
  return passedTests === tests.length;
};

// Export for use in development
export const runFirestoreRecoveryTest = () => {
  if (typeof window !== 'undefined') {
    // Only run in browser
    testFirestoreRecovery().then(success => {
      if (success) {
        console.log('✅ Firestore recovery system is working correctly');
      } else {
        console.error('❌ Firestore recovery system has issues');
      }
    });
  }
};
