'use client';

import { useState, useEffect } from 'react';
import { useNetworkStatus, useSlowConnection } from '@/hooks/useNetworkStatus';
import {
  shouldSkipFirebase,
  isStaticPage,
  getCurrentPathname,
} from '@/lib/static-page-detection';

interface DataLoadingDebugProps {
  componentName: string;
  dataLength?: number;
  loading?: boolean;
  error?: string | null;
}

export function DataLoadingDebug({
  componentName,
  dataLength = 0,
  loading = false,
  error = null,
}: DataLoadingDebugProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const networkStatus = useNetworkStatus();
  const isSlowConnection = useSlowConnection();
  const pathname = getCurrentPathname();
  const isStatic = isStaticPage(pathname);
  const skipFirebase = shouldSkipFirebase();

  useEffect(() => {
    setMounted(true);

    // Show debug panel in development mode
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible || !mounted) return null;

  const getStatusColor = () => {
    if (error) return 'text-destructive';
    if (loading) return 'text-warning';
    if (dataLength > 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (loading) return 'Loading';
    if (dataLength > 0) return 'Loaded';
    return 'Empty';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Data Loading Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Component:</span>
          <span className="font-mono">{componentName}</span>
        </div>

        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Data Items:</span>
          <span>{dataLength}</span>
        </div>

        <div className="flex justify-between">
          <span>Page Type:</span>
          <span className={isStatic ? 'text-primary' : 'text-secondary'}>
            {isStatic ? 'Static' : 'Dynamic'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Firebase:</span>
          <span className={skipFirebase ? 'text-destructive' : 'text-success'}>
            {skipFirebase ? 'Skipped' : 'Active'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Network:</span>
          <span
            className={
              networkStatus.online ? 'text-success' : 'text-destructive'
            }
          >
            {networkStatus.online ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Connection:</span>
          <span className={isSlowConnection ? 'text-warning' : 'text-success'}>
            {networkStatus.effectiveType}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Mounted:</span>
          <span className={mounted ? 'text-success' : 'text-destructive'}>
            {mounted ? 'Yes' : 'No'}
          </span>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          Press Ctrl+Shift+D to toggle
        </div>
      </div>
    </div>
  );
}
