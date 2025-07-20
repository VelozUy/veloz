import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Users,
  Clock,
  MousePointer,
  Image,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  CheckCircle,
  ZoomIn,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  description?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  progress?: number;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

interface MetricData {
  totalViews?: number;
  uniqueVisitors?: number;
  avgTimeOnPage?: number;
  ctaClicks?: number;
  mediaInteractions?: number;
  crewInteractions?: number;
  viewsChange?: number;
  visitorsChange?: number;
  timeChange?: number;
  ctaChange?: number;
  mediaChange?: number;
  crewChange?: number;
  viewsProgress?: number;
  visitorsProgress?: number;
  ctaProgress?: number;
  timeTrend?: number;
  mediaTrend?: number;
  crewTrend?: number;
  mediaInteractionBreakdown?: {
    views: number;
    plays: number;
    pauses: number;
    completes: number;
    zooms: number;
  };
  deviceBreakdown?: Record<string, number>;
}

export function MetricCard({
  title,
  value,
  description,
  change,
  changeType = 'neutral',
  icon,
  progress,
  trend,
}: MetricCardProps) {
  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3 text-primary" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-primary';
      case 'decrease':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}

        {(change !== undefined || trend) && (
          <div className="flex items-center gap-2 mt-2">
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {getChangeIcon()}
                <span className={`text-xs font-medium ${getChangeColor()}`}>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-primary" />
                ) : trend.direction === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        )}

        {progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {progress}% of target
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized metric cards for different analytics data
export function ViewsMetricCard({ data }: { data: MetricData }) {
  return (
    <MetricCard
      title="Total Views"
      value={data?.totalViews || 0}
      description="Total project page views"
      change={data?.viewsChange}
      changeType={
        data?.viewsChange && data.viewsChange > 0 ? 'increase' : 'decrease'
      }
      icon={<Eye className="h-3 w-3" />}
      progress={data?.viewsProgress}
    />
  );
}

export function VisitorsMetricCard({ data }: { data: MetricData }) {
  return (
    <MetricCard
      title="Unique Visitors"
      value={data?.uniqueVisitors || 0}
      description="Unique visitors to project pages"
      change={data?.visitorsChange}
      changeType={
        data?.visitorsChange && data.visitorsChange > 0
          ? 'increase'
          : 'decrease'
      }
      icon={<Users className="h-3 w-3" />}
      progress={data?.visitorsProgress}
    />
  );
}

export function TimeOnPageMetricCard({ data }: { data: MetricData }) {
  return (
    <MetricCard
      title="Avg. Time on Page"
      value={data?.avgTimeOnPage || 0}
      description="Average time spent on project pages (seconds)"
      change={data?.timeChange}
      changeType={
        data?.timeChange && data.timeChange > 0 ? 'increase' : 'decrease'
      }
      icon={<Clock className="h-3 w-3" />}
      trend={{
        value: data?.timeTrend || 0,
        label: 'vs last period',
        direction: data?.timeTrend && data.timeTrend > 0 ? 'up' : 'down',
      }}
    />
  );
}

export function CtaClicksMetricCard({ data }: { data: MetricData }) {
  return (
    <MetricCard
      title="CTA Clicks"
      value={data?.ctaClicks || 0}
      description="Contact form submissions and CTA interactions"
      change={data?.ctaChange}
      changeType={
        data?.ctaChange && data.ctaChange > 0 ? 'increase' : 'decrease'
      }
      icon={<MousePointer className="h-3 w-3" />}
      progress={data?.ctaProgress}
    />
  );
}

export function MediaInteractionsMetricCard({ data }: { data: MetricData }) {
  return (
    <MetricCard
      title="Media Interactions"
      value={data?.mediaInteractions || 0}
      description="Photo and video interactions"
      change={data?.mediaChange}
      changeType={
        data?.mediaChange && data.mediaChange > 0 ? 'increase' : 'decrease'
      }
      icon={<Image className="h-3 w-3" />}
      trend={{
        value: data?.mediaTrend || 0,
        label: 'vs last period',
        direction: data?.mediaTrend && data.mediaTrend > 0 ? 'up' : 'down',
      }}
    />
  );
}

export function CrewInteractionsMetricCard({ data }: { data: MetricData }) {
  return (
    <MetricCard
      title="Crew Interactions"
      value={data?.crewInteractions || 0}
      description="Team member profile interactions"
      change={data?.crewChange}
      changeType={
        data?.crewChange && data.crewChange > 0 ? 'increase' : 'decrease'
      }
      icon={<UserCheck className="h-3 w-3" />}
      trend={{
        value: data?.crewTrend || 0,
        label: 'vs last period',
        direction: data?.crewTrend && data.crewTrend > 0 ? 'up' : 'down',
      }}
    />
  );
}

// New detailed media interaction breakdown card
export function MediaInteractionBreakdownCard({ data }: { data: MetricData }) {
  const breakdown = data?.mediaInteractionBreakdown;

  if (!breakdown) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
          <CardTitle className="text-xs font-medium">Media Breakdown</CardTitle>
          <div className="text-muted-foreground">
            <Image className="h-3 w-3" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">
            No media interaction data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalInteractions =
    breakdown.views +
    breakdown.plays +
    breakdown.pauses +
    breakdown.completes +
    breakdown.zooms;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
        <CardTitle className="text-xs font-medium">Media Breakdown</CardTitle>
        <div className="text-muted-foreground">
          <Image className="h-3 w-3" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-xl font-bold">{totalInteractions}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed media interaction metrics
        </p>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-primary" />
              <span>Views</span>
            </div>
            <span className="font-medium">{breakdown.views}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3 text-primary" />
              <span>Plays</span>
            </div>
            <span className="font-medium">{breakdown.plays}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Pause className="h-3 w-3 text-muted-foreground" />
              <span>Pauses</span>
            </div>
            <span className="font-medium">{breakdown.pauses}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Completes</span>
            </div>
            <span className="font-medium">{breakdown.completes}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <ZoomIn className="h-3 w-3 text-primary" />
              <span>Zooms</span>
            </div>
            <span className="font-medium">{breakdown.zooms}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Device breakdown metric card
export function DeviceBreakdownCard({ data }: { data: MetricData }) {
  const deviceBreakdown = data?.deviceBreakdown;

  if (!deviceBreakdown || Object.keys(deviceBreakdown).length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
          <CardTitle className="text-xs font-medium">
            Device Breakdown
          </CardTitle>
          <div className="text-muted-foreground">
            <Monitor className="h-3 w-3" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">
            No device data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalDevices = Object.values(deviceBreakdown).reduce(
    (sum, count) => sum + count,
    0
  );

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return <Monitor className="h-3 w-3 text-primary" />;
      case 'mobile':
        return <Smartphone className="h-3 w-3 text-primary" />;
      case 'tablet':
        return <Tablet className="h-3 w-3 text-primary" />;
      default:
        return <Monitor className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return 'Desktop';
      case 'mobile':
        return 'Mobile';
      case 'tablet':
        return 'Tablet';
      default:
        return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
        <CardTitle className="text-xs font-medium">Device Breakdown</CardTitle>
        <div className="text-muted-foreground">
          <Monitor className="h-3 w-3" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-xl font-bold">{totalDevices}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Traffic by device type
        </p>

        <div className="mt-3 space-y-2">
          {Object.entries(deviceBreakdown)
            .sort(([, a], [, b]) => b - a) // Sort by count descending
            .map(([deviceType, count]) => {
              const percentage =
                totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
              return (
                <div
                  key={deviceType}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1">
                    {getDeviceIcon(deviceType)}
                    <span>{getDeviceLabel(deviceType)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-muted-foreground">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {children}
    </div>
  );
}
