# ProjectAnalytics Component

A comprehensive analytics dashboard component for project management that provides detailed insights into project performance, timeline analysis, financial metrics, team performance, and business analytics.

## Features

### 📊 Overview Tab
- **Key Metrics Grid**: Total projects, average duration, total revenue, client satisfaction
- **Project Performance Summary**: Quick overview of all projects with status, progress, and budget utilization

### 🎯 Performance Tab
- **Project Progress**: Overall progress tracking with task completion metrics
- **Timeline Performance**: On-time status, days remaining/overdue
- **Communication Metrics**: Total communications, client engagement, response times
- **Client Satisfaction**: Ratings, feedback, and last contact information

### 📅 Timeline Tab
- **Project Timeline Analysis**: Actual vs planned progress with variance calculations
- **Milestone Tracking**: Individual milestone status with completion dates

### 💰 Financial Tab
- **Budget Performance**: Total budget, spent amount, remaining budget, utilization percentage
- **Revenue Analysis**: Monthly revenue trends and project type revenue breakdown

### 👥 Team Tab
- **Team Performance**: Assigned members, task completion, efficiency metrics
- **Team Insights**: Performance highlights and recommendations

### 🏢 Business Tab
- **Business Overview**: Active projects, client retention, average project value, team productivity
- **Revenue Trends**: Monthly revenue and top client analysis

## Usage

### Basic Usage
```tsx
import ProjectAnalytics from '@/components/admin/ProjectAnalytics';

// Default usage with business metrics
<ProjectAnalytics />

// Without business metrics tab
<ProjectAnalytics showBusinessMetrics={false} />

// For specific project
<ProjectAnalytics projectId="project-123" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projectId` | `string` | `undefined` | Specific project ID to analyze |
| `showBusinessMetrics` | `boolean` | `true` | Whether to show the business metrics tab |

### Integration with Analytics Service

The component integrates with the existing analytics service (`@/lib/analytics`) to fetch:

- **Project Metrics**: Individual project performance data
- **Business Metrics**: Overall business analytics
- **Timeline Analysis**: Project timeline and milestone data
- **Revenue Analysis**: Financial performance metrics

### Data Sources

- **Firestore Collections**:
  - `projects`: Project data and metadata
  - `project_communications`: Communication history
  - `analytics`: Analytics events and metrics

### Features

- **Real-time Data**: Fetches live data from Firestore
- **Date Range Filtering**: 7-day, 30-day, 90-day views
- **Export Functionality**: Download analytics data (placeholder)
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error display

### Styling

Uses the existing UI component library:
- `@/components/ui/card` for metric cards
- `@/components/ui/tabs` for tab navigation
- `@/components/ui/progress` for progress bars
- `@/components/ui/badge` for status indicators
- `@/components/ui/button` for actions

### Testing

Comprehensive test coverage in `src/components/admin/__tests__/ProjectAnalytics.test.tsx`:

- Component rendering
- Tab navigation
- Data loading states
- Error handling
- Props validation

## Integration Example

The component is integrated into the admin analytics page:

```tsx
// src/app/admin/analytics/page.tsx
<TabsContent value="projects" className="space-y-3">
  <ProjectAnalytics showBusinessMetrics={true} />
</TabsContent>
```

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: More granular date ranges and filters
- **Export Formats**: CSV, PDF, Excel export options
- **Custom Dashboards**: User-configurable metric layouts
- **Drill-down Capabilities**: Click-through to detailed views
- **Comparative Analysis**: Period-over-period comparisons 