'use client';

import { useState, useEffect } from 'react';
import { browserTester, type TestSuite, manualTestingChecklist } from '@/lib/test-checklist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BrowserTestPage() {
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get browser info on component mount
    setBrowserInfo(browserTester.getBrowserInfo());
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await browserTester.runComprehensiveTests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const report = browserTester.generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veloz-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">✅ Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-500">❌ Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">⚠️ Warning</Badge>;
      case 'pending':
        return <Badge className="bg-gray-500">⏳ Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const overallStatus = browserTester.getOverallStatus();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Veloz Browser Testing</h1>
        <p className="text-gray-600">
          Comprehensive testing suite to verify application functionality across different browsers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Browser Information */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
            <CardDescription>Current browser details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(browserInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="text-gray-600 truncate ml-2">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Run automated tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run Comprehensive Tests'}
            </Button>
            
            {testResults.length > 0 && (
              <Button 
                onClick={downloadReport} 
                variant="outline"
                className="w-full"
              >
                Download Test Report
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Overall Status */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Overall Status</CardTitle>
              <CardDescription>Test suite summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {getStatusBadge(overallStatus)}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Suites:</span>
                    <span>{testResults.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Passed:</span>
                    <span className="text-green-600">
                      {testResults.reduce((sum, suite) => sum + suite.passed, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed:</span>
                    <span className="text-red-600">
                      {testResults.reduce((sum, suite) => sum + suite.failed, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Warnings:</span>
                    <span className="text-yellow-600">
                      {testResults.reduce((sum, suite) => sum + suite.warnings, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="automated" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automated">Automated Tests</TabsTrigger>
          <TabsTrigger value="manual">Manual Testing Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <p>No test results yet. Click "Run Comprehensive Tests" to start testing.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {testResults.map((suite, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{suite.name}</CardTitle>
                      <div className="flex gap-2">
                        {suite.passed > 0 && (
                          <Badge className="bg-green-500">{suite.passed} passed</Badge>
                        )}
                        {suite.failed > 0 && (
                          <Badge className="bg-red-500">{suite.failed} failed</Badge>
                        )}
                        {suite.warnings > 0 && (
                          <Badge className="bg-yellow-500">{suite.warnings} warnings</Badge>
                        )}
                        {suite.pending > 0 && (
                          <Badge className="bg-gray-500">{suite.pending} pending</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suite.tests.map((test, testIndex) => (
                        <div key={testIndex} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge(test.status)}
                              <span className="font-medium">{test.test}</span>
                            </div>
                            <p className="text-sm text-gray-600">{test.message}</p>
                            {test.details && (
                              <details className="mt-2">
                                <summary className="text-xs cursor-pointer text-blue-600">View details</summary>
                                <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                                  {JSON.stringify(test.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {test.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(manualTestingChecklist).map(([browser, checklist]) => (
              <Card key={browser}>
                <CardHeader>
                  <CardTitle className="capitalize">{browser} Testing</CardTitle>
                  <CardDescription>Manual testing checklist for {browser}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{item.replace('✅ ', '')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Navigation Tests */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Navigation Tests</CardTitle>
          <CardDescription>Test basic navigation functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.open('/', '_blank')}
            >
              Test Homepage
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/gallery', '_blank')}
            >
              Test Gallery
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/contact', '_blank')}
            >
              Test Contact
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin', '_blank')}
            >
              Test Admin
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/en', '_blank')}
            >
              Test English
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/pt', '_blank')}
            >
                                Test Português (Brasil)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/en/about', '_blank')}
            >
              Test About (EN)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/debug/firebase', '_blank')}
            >
              Test Firebase Debug
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Automated Testing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Click "Run Comprehensive Tests" to execute automated tests</li>
                <li>Review the results in the test suites below</li>
                <li>Download the test report for documentation</li>
                <li>Address any failed tests or warnings</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Manual Testing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open this page in Chrome, Firefox, and Safari</li>
                <li>Run automated tests in each browser</li>
                <li>Follow the manual testing checklist for each browser</li>
                <li>Use the "Quick Navigation Tests" buttons to test different pages</li>
                <li>Check browser console for JavaScript errors</li>
                <li>Test responsive design by resizing the browser window</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Performance Testing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open browser developer tools (F12)</li>
                <li>Go to the "Performance" or "Timeline" tab</li>
                <li>Record a page load and review the metrics</li>
                <li>Check the "Lighthouse" tab for SEO and accessibility scores</li>
                <li>Review the "Network" tab for loading times and asset sizes</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 