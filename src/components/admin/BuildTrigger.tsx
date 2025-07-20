'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { triggerBuild, BuildTriggerResponse } from '@/services/build-trigger';

interface BuildTriggerProps {
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function BuildTrigger({
  className = '',
  variant = 'default',
  size = 'default',
}: BuildTriggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastBuildStatus, setLastBuildStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleTriggerBuild = async () => {
    setIsLoading(true);
    setLastBuildStatus('idle');

    try {
      const result: BuildTriggerResponse = await triggerBuild();

      if (result.success) {
        setLastBuildStatus('success');
        setNotification({
          type: 'success',
          message: `Build triggered successfully! Build ID: ${result.buildId}`,
        });
        // Clear notification after 5 seconds
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
      } else {
        setLastBuildStatus('error');
        setNotification({
          type: 'error',
          message: result.error || 'Failed to trigger build',
        });
        // Clear notification after 5 seconds
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
      }
    } catch {
      setLastBuildStatus('error');
      setNotification({
        type: 'error',
        message: 'An unexpected error occurred while triggering the build',
      });
      // Clear notification after 5 seconds
      setTimeout(() => setNotification({ type: null, message: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Triggering Build...
        </>
      );
    }

    if (lastBuildStatus === 'success') {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2 text-primary" />
          Build Triggered
        </>
      );
    }

    if (lastBuildStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
          Build Failed
        </>
      );
    }

    return (
      <>
        <RefreshCw className="w-4 h-4 mr-2" />
        Trigger New Build
      </>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleTriggerBuild}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
        aria-label="Trigger new app build"
      >
        {getButtonContent()}
      </Button>

      {notification.type && (
        <div
          className={`text-sm p-2 rounded-md ${
            notification.type === 'success'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
