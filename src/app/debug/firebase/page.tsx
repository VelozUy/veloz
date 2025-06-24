'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  quickDiagnostics,
  attemptAutoFix,
  DiagnosticResult,
} from '@/lib/firebase-diagnostics';
import {
  checkFirestoreSecurityRules,
  getRecommendedSecurityRules,
  SecurityRulesResult,
} from '@/lib/firestore-rules-checker';
import {
  resetFirestore,
  lightResetFirestore,
  resetTargetIdCollision,
  emergencyReload,
  ResetResult,
} from '@/lib/firestore-reset';
import { resetDatabase, nuclearReset, ResetStep } from '@/lib/database-reset';
import {
  reinitializeFirebase,
  forceReload,
  ReinitResult,
} from '@/lib/firebase-reinit';
import { simpleBrowserReset, forcePageReplace } from '@/lib/simple-reset';
import { executeEmergencyFirestoreFix } from '@/lib/emergency-firestore-fix';

export default function FirebaseDebugPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [securityRulesResults, setSecurityRulesResults] = useState<
    SecurityRulesResult[]
  >([]);
  const [resetResults, setResetResults] = useState<ResetResult[]>([]);
  const [dbResetResults, setDbResetResults] = useState<ResetStep[]>([]);
  const [dbResetting, setDbResetting] = useState(false);
  const [reinitResults, setReinitResults] = useState<ReinitResult[]>([]);
  const [reinitializing, setReinitializing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const [checkingRules, setCheckingRules] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [lightResetting, setLightResetting] = useState(false);
  const [targetIdResetting, setTargetIdResetting] = useState(false);
  const [emergencyFixing, setEmergencyFixing] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await quickDiagnostics();
      setDiagnostics(results);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = async () => {
    setAutoFixing(true);
    try {
      await attemptAutoFix();
      // Run diagnostics again to see if issues were resolved
      await runDiagnostics();
    } catch (error) {
      console.error('Auto-fix failed:', error);
    } finally {
      setAutoFixing(false);
    }
  };

  const checkSecurityRules = async () => {
    setCheckingRules(true);
    try {
      const results = await checkFirestoreSecurityRules();
      setSecurityRulesResults(results);
    } catch (error) {
      console.error('Security rules check failed:', error);
    } finally {
      setCheckingRules(false);
    }
  };

  const performReset = async () => {
    setResetting(true);
    try {
      const results = await resetFirestore();
      setResetResults(results);
      // Note: Page will reload automatically after full reset
    } catch (error) {
      console.error('Firestore reset failed:', error);
      setResetting(false);
    }
  };

  const performLightReset = async () => {
    setLightResetting(true);
    try {
      const results = await lightResetFirestore();
      setResetResults(results);

      // Re-run diagnostics after light reset
      setTimeout(() => {
        runDiagnostics();
        checkSecurityRules();
      }, 2000);
    } catch (error) {
      console.error('Light reset failed:', error);
    } finally {
      setLightResetting(false);
    }
  };

  const performTargetIdReset = async () => {
    setTargetIdResetting(true);
    try {
      const results = await resetTargetIdCollision();
      setResetResults(results);

      // Re-run diagnostics after target ID reset
      setTimeout(() => {
        runDiagnostics();
        checkSecurityRules();
      }, 4000); // Wait longer due to the 3-second cleanup delay
    } catch (error) {
      console.error('Target ID reset failed:', error);
    } finally {
      setTargetIdResetting(false);
    }
  };

  const performDatabaseReset = async () => {
    if (
      !confirm(
        '⚠️ This will DELETE ALL DATA in your Firestore database and reset everything. Are you sure? This cannot be undone!'
      )
    ) {
      return;
    }

    setDbResetting(true);
    try {
      const results = await resetDatabase();
      setDbResetResults(results);
      // Page will reload automatically
    } catch (error) {
      console.error('Database reset failed:', error);
      setDbResetting(false);
    }
  };

  const performFirebaseReinit = async () => {
    if (
      !confirm(
        '🔄 This will completely destroy and recreate the Firebase instance. This should fix persistent Target ID conflicts. Continue?'
      )
    ) {
      return;
    }

    setReinitializing(true);
    try {
      const results = await reinitializeFirebase();
      setReinitResults(results);
      // Page will reload automatically
    } catch (error) {
      console.error('Firebase reinitialization failed:', error);
      setReinitializing(false);
    }
  };

  const performEmergencyFix = async () => {
    if (
      !confirm(
        '🚨 EMERGENCY FIX: This will clear all Firebase state and force reload. Use this for cascading assertion errors. Continue?'
      )
    ) {
      return;
    }

    setEmergencyFixing(true);
    try {
      await executeEmergencyFirestoreFix();
      // Page will reload automatically
    } catch (error) {
      console.error('Emergency fix failed:', error);
      setEmergencyFixing(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
    checkSecurityRules();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const failedTests = diagnostics.filter(d => d.status === 'fail');
  const warningTests = diagnostics.filter(d => d.status === 'warning');
  const passedTests = diagnostics.filter(d => d.status === 'pass');

  // Check for Target ID collision errors
  const hasTargetIdError = diagnostics.some(
    d =>
      d.message?.includes('Target ID already exists') ||
      d.message?.includes('Target ID collision') ||
      d.details?.error?.toString().includes('Target ID already exists')
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Firebase Debug Center
          </h1>
          <p className="text-muted-foreground">
            Diagnose and fix Firebase connection issues
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Run Diagnostics
          </Button>

          <Button
            variant="outline"
            onClick={handleAutoFix}
            disabled={autoFixing || diagnostics.length === 0}
          >
            {autoFixing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Auto Fix
          </Button>

          <Button
            variant="secondary"
            onClick={checkSecurityRules}
            disabled={checkingRules}
          >
            {checkingRules ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Check Security Rules
          </Button>

          <Button
            variant="destructive"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh
          </Button>

          <Button
            variant="outline"
            onClick={performLightReset}
            disabled={lightResetting || resetting || targetIdResetting}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            {lightResetting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Light Reset
          </Button>

          {hasTargetIdError && (
            <Button
              variant="outline"
              onClick={performTargetIdReset}
              disabled={targetIdResetting || resetting || lightResetting}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              {targetIdResetting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Target ID Reset
            </Button>
          )}

          <Button
            variant="outline"
            onClick={performReset}
            disabled={resetting || lightResetting || targetIdResetting}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Deep Reset
          </Button>

          <Button
            variant="destructive"
            onClick={emergencyReload}
            className="bg-red-600 hover:bg-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Emergency Reload
          </Button>
        </div>

        {/* Development Reset Section */}
        <div className="border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              🚨 Development Reset Zone
            </h3>
            <p className="text-sm text-red-600">
              These options will <strong>DELETE ALL DATA</strong> in your
              database. Only use during development!
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="destructive"
              onClick={performDatabaseReset}
              disabled={dbResetting}
              className="bg-red-700 hover:bg-red-800"
            >
              {dbResetting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reset Database & Client
            </Button>

            <Button
              variant="destructive"
              onClick={performFirebaseReinit}
              disabled={reinitializing}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {reinitializing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Firebase Reinit
            </Button>

            <Button
              variant="destructive"
              onClick={nuclearReset}
              className="bg-red-900 hover:bg-red-950"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Nuclear Reset
            </Button>

            <Button
              variant="destructive"
              onClick={simpleBrowserReset}
              className="bg-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Simple Reset
            </Button>

            <Button
              variant="destructive"
              onClick={forcePageReplace}
              className="bg-black hover:bg-gray-800"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Page Replace
            </Button>
          </div>
        </div>

        {/* Summary */}
        {diagnostics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {passedTests.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tests Passed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {warningTests.length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {failedTests.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tests Failed
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Internal Assertion Error Alert */}
        {(diagnostics.some(d => d.message.includes('INTERNAL ASSERTION')) ||
          (typeof window !== 'undefined' &&
            window.console.toString().includes('INTERNAL ASSERTION'))) && (
          <Alert variant="destructive" className="border-red-500">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>🚨 Firestore Internal Assertion Error Detected!</strong>
              <div className="mt-2 space-y-1">
                <p>
                  This error indicates Firestore is in a corrupted state. This
                  commonly happens due to:
                </p>
                <ul className="list-disc list-inside text-sm">
                  <li>Connection issues or network interruptions</li>
                  <li>Rapid online/offline state changes</li>
                  <li>Cached corrupted data in browser storage</li>
                </ul>
                <div className="mt-3 space-y-2">
                  <p className="font-semibold">Fix Options:</p>
                  <ul className="text-sm space-y-1">
                    <li>
                      <strong>Light Reset:</strong> Quick fix - clears cache and
                      resets network (try this first)
                    </li>
                    <li>
                      <strong>Deep Reset:</strong> Full reset - terminates
                      Firestore and reloads page (for severe corruption)
                    </li>
                    <li>
                      <strong>Emergency Fix:</strong> Nuclear option - for
                      cascading assertion errors like ID: ca9, b815
                    </li>
                  </ul>
                  <div className="mt-4">
                    <Button
                      onClick={performEmergencyFix}
                      disabled={emergencyFixing}
                      variant="destructive"
                      size="sm"
                    >
                      {emergencyFixing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Emergency Fixing...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Emergency Fix Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Reset Results */}
        {resetResults.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-orange-700 dark:text-orange-300">
                🔄 Firestore Reset Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resetResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <span className="text-sm">{result.step}</span>
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {result.error && (
                        <span className="text-xs text-muted-foreground max-w-xs truncate">
                          {result.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Database Reset Results */}
        {dbResetResults.length > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300">
                🗑️ Database Reset Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dbResetResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <span className="text-sm">{result.step}</span>
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {result.error && (
                        <span className="text-xs text-muted-foreground max-w-xs truncate">
                          {result.error}
                        </span>
                      )}
                      {result.details && (
                        <span className="text-xs text-muted-foreground max-w-xs truncate">
                          {result.details}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Firebase Reinit Results */}
        {reinitResults.length > 0 && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-purple-700 dark:text-purple-300">
                🔄 Firebase Reinitialization Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reinitResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <span className="text-sm">{result.step}</span>
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {result.error && (
                        <span className="text-xs text-muted-foreground max-w-xs truncate">
                          {result.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Issues Alert */}
        {failedTests.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical Issues Detected:</strong> {failedTests.length}{' '}
              test(s) failed. Firebase functionality may be limited until these
              issues are resolved.
              {diagnostics.some(d =>
                d.message.includes('client is offline')
              ) && (
                <div className="mt-2">
                  <strong>🎯 Root Cause Found:</strong> Firestore client is
                  offline - this is causing your 400 Bad Request errors!
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Security Rules Results */}
        {securityRulesResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Security Rules Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRulesResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-semibold">{result.test}</h3>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>

                    <p className="text-muted-foreground mb-2">
                      {result.message}
                    </p>

                    {result.solution && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          Solution:
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {result.solution}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Security Rules */}
        {securityRulesResults.some(r => r.status === 'fail') && (
          <Card>
            <CardHeader>
              <CardTitle>🔧 Recommended Security Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Copy and paste these rules into your Firebase Console →
                Firestore Database → Rules:
              </p>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                {getRecommendedSecurityRules(true)}
              </pre>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>⚠️ Development Rules:</strong> These rules allow all
                  access for development. Use proper authentication-based rules
                  for production.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnostic Results */}
        {diagnostics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostics.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-semibold">{result.test}</h3>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>

                    <p className="text-muted-foreground mb-2">
                      {result.message}
                    </p>

                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offline Fix Section */}
        {diagnostics.some(d => d.message.includes('client is offline')) && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300">
                🚨 Firestore Offline Issue Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded">
                  <p className="text-red-700 dark:text-red-300 font-semibold mb-2">
                    This is the root cause of your 400 Bad Request errors!
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    When Firestore client is offline, it cannot establish
                    real-time listeners, causing the 400 errors you&apos;re
                    seeing.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Quick Fixes to Try:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>
                      Click the &quot;Auto Fix&quot; button above to reset the
                      Firestore connection
                    </li>
                    <li>
                      Refresh your browser page completely (Cmd+R or Ctrl+R)
                    </li>
                    <li>Clear your browser cache and cookies for this site</li>
                    <li>
                      Check if you have any browser extensions blocking Firebase
                    </li>
                    <li>Try opening the site in an incognito/private window</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Solutions */}
        <Card>
          <CardHeader>
            <CardTitle>Common Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  📱 Firestore Offline Issues
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  If Firestore client is offline (causing 400 errors):
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>
                    Use the &quot;Auto Fix&quot; button to reset network
                    connection
                  </li>
                  <li>Refresh the page completely</li>
                  <li>Clear browser cache and localStorage</li>
                  <li>Check for browser extensions blocking Firebase</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  🔐 Permission Denied Errors
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  If you&apos;re seeing permission denied errors, check your
                  Firestore Security Rules:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Go to Firebase Console → Firestore Database → Rules</li>
                  <li>
                    For development, you can use:{' '}
                    <code className="bg-muted px-1 rounded">
                      allow read, write: if true;
                    </code>
                  </li>
                  <li>
                    For production, implement proper authentication-based rules
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  🌐 Network Connection Issues
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For network-related problems:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Check your internet connection</li>
                  <li>Disable any VPN or proxy that might block Firebase</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try incognito/private browsing mode</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">⚙️ Configuration Issues</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For configuration problems:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Verify all environment variables are set correctly</li>
                  <li>Check that your Firebase project exists and is active</li>
                  <li>Ensure Firestore is enabled in your Firebase project</li>
                  <li>
                    Verify your domain is authorized in Firebase Auth settings
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Admin */}
        <div className="text-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back to Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
