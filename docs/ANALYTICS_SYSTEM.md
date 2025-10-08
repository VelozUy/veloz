# Analytics System Documentation

**Last Updated**: 2025-01-27  
**Status**: ✅ Production Ready  
**Version**: 1.0.0

---

## 📊 Overview

The Veloz Analytics System provides comprehensive tracking of user behavior, traffic sources, and campaign performance. Built with Firebase Analytics (GA4) and GDPR compliance in mind, it offers real-time insights through a professional admin dashboard.

---

## 🎯 Key Features

### Traffic Source Tracking

- **Automatic Detection**: Identifies where users come from (direct, organic, social, referral)
- **UTM Parameter Support**: Full support for campaign tracking parameters
- **Referrer Detection**: Intelligent parsing of referrer URLs
- **Campaign Attribution**: Links user actions to marketing campaigns

### Supported Traffic Sources

- **Direct**: Users who type URL directly or use bookmarks
- **Organic**: Search engine traffic (Google, Bing, etc.)
- **Social**: Social media platforms (Instagram, Facebook, Twitter, LinkedIn, YouTube, TikTok)
- **Referral**: Traffic from other websites

### Analytics Events Tracked

1. **Page Views**: Track all page visits with traffic source data
2. **Project Views**: Monitor which projects users view
3. **Media Interactions**: Track image/video clicks and views
4. **CTA Interactions**: Monitor call-to-action button clicks
5. **Crew Interactions**: Track crew member profile views
6. **Error Events**: Log errors for debugging
7. **Scroll Depth**: Monitor how far users scroll
8. **Session Events**: Track session start/end
9. **Traffic Source Events**: Dedicated traffic source logging
10. **Campaign Events**: Track campaign-specific interactions

---

## 🏗️ Architecture

### Core Components

#### 1. `SimpleAnalyticsService` (`src/services/analytics-simple.ts`)

The main service handling analytics events:

- Firebase Analytics (GA4) integration
- Traffic source parsing
- Event enrichment with session data
- GDPR consent management

```typescript
class SimpleAnalyticsService {
  // Parse UTM parameters and referrer
  private getTrafficSourceData(): Record<string, unknown>;

  // Track various event types
  async trackPageView(pagePath: string, pageTitle?: string);
  async trackProjectView(projectId: string, projectTitle: string);
  async trackMediaInteraction(type: string, projectId: string, mediaId: string);
  async trackCTAInteraction(type: string, label: string, destination?: string);
  async trackCrewInteraction(crewId: string, action: string);
  async trackError(errorMessage: string, errorCode?: string);
  async trackScrollDepth(pagePath: string, depth: number);
  async trackTrafficSource();
  async trackCampaign(
    campaignName: string,
    campaignData?: Record<string, unknown>
  );
}
```

#### 2. `useAnalytics` Hook (`src/hooks/useAnalytics.ts`)

React hook for tracking user interactions:

- Lazy-loads analytics service
- Manages consent state
- Provides tracking functions
- Handles session lifecycle

#### 3. Analytics Data Service (`src/services/analytics-data.ts`)

Handles data aggregation and retrieval:

- Fetches events from Firestore
- Aggregates metrics and breakdowns
- Provides real-time analytics
- Generates summaries by period

#### 4. Admin Dashboard (`src/app/admin/analytics/page.tsx`)

Professional interface for viewing analytics:

- Traffic source breakdowns
- UTM campaign performance
- Referrer domain analysis
- Time-based filtering
- Export capabilities

---

## 📈 Admin Dashboard

### Accessing Analytics

Navigate to **Admin → Analytics** or visit `/admin/analytics`

### Available Metrics

#### Overview Cards

- **Total Views**: Overall page views
- **Unique Visitors**: Distinct session count
- **Avg Time on Page**: User engagement metric
- **CTA Clicks**: Call-to-action interactions
- **Media Interactions**: Image/video engagement
- **Crew Interactions**: Team profile views

#### Traffic Breakdowns

##### 1. Traffic Source Breakdown

Shows distribution of traffic by source type:

- Direct
- Organic (search engines)
- Social (social media platforms)
- Referral (other websites)

##### 2. Traffic Medium Breakdown

Shows distribution by medium:

- None (direct traffic)
- Organic
- Social
- Referral
- Paid (if using paid campaigns)

##### 3. UTM Source Breakdown

Shows specific sources from UTM parameters:

- Instagram
- Facebook
- Google Ads
- Email campaigns
- Custom sources

##### 4. UTM Campaign Breakdown

Shows performance by campaign name:

- Summer Campaign
- Product Launch
- Holiday Special
- Custom campaigns

##### 5. Referrer Domain Breakdown

Shows which domains send traffic:

- google.com
- facebook.com
- instagram.com
- Partner sites

### Tabs

#### 1. Overview

- Key metrics cards
- Traffic breakdowns
- Quick insights

#### 2. Projects

- Project-specific analytics
- View counts by project
- Engagement metrics

#### 3. Media

- Media interaction analytics
- Most viewed media
- Interaction types

#### 4. Traffic

- Detailed traffic source analysis
- Campaign performance
- Referrer insights
- UTM parameter tracking

#### 5. Sessions

- Session analytics
- User behavior patterns
- Session duration
- Bounce rates

---

## 🔧 Implementation Details

### Traffic Source Detection Logic

#### UTM Parameters (Highest Priority)

If URL contains UTM parameters, they override referrer detection:

```
?utm_source=instagram&utm_medium=story&utm_campaign=summer2025
```

Results in:

- `traffic_source`: "instagram"
- `traffic_medium`: "story"
- `traffic_campaign`: "summer2025"

#### Referrer Detection (Second Priority)

If no UTM parameters, analyzes the referrer URL:

```
Referrer: https://www.google.com/search?q=photography
```

Results in:

- `traffic_source`: "google"
- `traffic_medium`: "organic"

Supported referrers:

- **Google**: `google.com` → organic
- **Facebook**: `facebook.com`, `fb.com` → social
- **Instagram**: `instagram.com` → social
- **Twitter/X**: `twitter.com`, `x.com` → social
- **LinkedIn**: `linkedin.com` → social
- **YouTube**: `youtube.com` → social
- **TikTok**: `tiktok.com` → social
- **Other**: Any other domain → referral

#### Direct Traffic (Default)

No UTM parameters and no referrer:

- `traffic_source`: "direct"
- `traffic_medium`: "none"

### Event Data Structure

Every analytics event includes:

```typescript
{
  // Event identification
  eventType: string,           // e.g., "page_view", "project_view"
  eventData: Record<string, unknown>, // Event-specific data

  // Session context
  sessionId: string,            // Unique session identifier
  deviceType: "desktop" | "mobile" | "tablet",
  userLanguage: string,         // e.g., "es", "en", "pt"
  timestamp: Timestamp,         // Firebase timestamp

  // Traffic source data (automatically added)
  traffic_source: string,       // e.g., "instagram", "google", "direct"
  traffic_medium: string,       // e.g., "social", "organic", "none"
  traffic_campaign: string,     // Campaign name from UTM
  utm_source: string,           // Original UTM source
  utm_medium: string,           // Original UTM medium
  utm_campaign: string,         // Original UTM campaign
  utm_content: string,          // UTM content parameter
  utm_term: string,             // UTM term parameter
  referrer: string,             // Full referrer URL
  referrer_domain: string,      // Referrer domain only
  landing_page: string,         // First page visited
  full_url: string,             // Complete URL with query params

  // Optional
  userId?: string,              // If user is authenticated
  userAgent?: string,           // Browser user agent
}
```

---

## 🧪 Testing

### Unit Tests

#### Traffic Source Parsing Tests

Location: `src/__tests__/unit/analytics-traffic.test.ts`

Tests cover:

- ✅ UTM parameter parsing (Instagram story example)
- ✅ Google organic traffic detection from referrer
- ✅ Unknown domain fallback to referral
- ✅ Direct traffic when no UTM/referrer

#### Analytics Aggregation Tests

Location: `src/lib/__tests__/analytics-aggregation.test.ts`

Tests cover:

- ✅ Traffic source breakdown aggregation
- ✅ Traffic medium breakdown aggregation
- ✅ UTM source breakdown aggregation
- ✅ UTM campaign breakdown aggregation
- ✅ Referrer domain breakdown aggregation

### Running Tests

```bash
# Run analytics tests only
npm test -- analytics-traffic.test analytics-aggregation.test

# Run all tests
npm test
```

---

## 🔐 GDPR Compliance

### Consent Management

- Analytics only run after user consent
- Consent status stored in localStorage
- Respects user privacy preferences
- Clear opt-in/opt-out mechanism

### Consent Banner

Component: `src/components/analytics/AnalyticsConsentBanner.tsx`

- Appears on first visit
- Two options: "Accept Analytics" or "Essential Only"
- Remembers user choice
- Can be changed later

### Data Privacy

- No personal information stored without consent
- IP addresses not captured client-side
- Session IDs are anonymous
- User can withdraw consent anytime

---

## 📝 Usage Examples

### Basic Page View Tracking

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyPage() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('/my-page', 'My Page Title');
  }, []);

  return <div>My Page</div>;
}
```

### Project View Tracking

```typescript
const { trackProjectView } = useAnalytics();

trackProjectView('project-123', 'Wedding Portfolio');
```

### CTA Click Tracking

```typescript
const { trackCTAClick } = useAnalytics();

<button onClick={() => trackCTAClick('contact', 'Contact Us Button', '/contact')}>
  Contact Us
</button>
```

### Campaign Tracking URL

```
https://veloz.com.uy/?utm_source=instagram&utm_medium=story&utm_campaign=summer2025&utm_content=hero-image
```

---

## 🚀 Deployment

### Environment Variables

Required in `.env.local`:

```env
# Firebase Configuration (for Analytics)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Firestore Security Rules

```firestore
// Analytics Collection - Allow public writes for analytics tracking
match /analytics/{analyticsId} {
  allow create: if true; // Allow public creation for analytics tracking
  allow read, write, delete: if isActiveAdmin(); // Only admins can manage analytics data
}
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Firestore rules deployed
- [ ] Firebase Analytics enabled in console
- [ ] GDPR consent banner tested
- [ ] Admin dashboard accessible
- [ ] Test UTM tracking with sample campaigns

---

## 🎨 Customization

### Adding New Event Types

1. **Define the event in `analytics-simple.ts`**:

```typescript
async trackCustomEvent(customData: Record<string, unknown>) {
  await this.logEvent('custom_event', customData);
}
```

2. **Export the function**:

```typescript
export const trackCustomEvent = (customData: Record<string, unknown>) =>
  simpleAnalyticsService.trackCustomEvent(customData);
```

3. **Add to useAnalytics hook**:

```typescript
const trackCustomEvent = useCallback(
  (customData: Record<string, unknown>) => {
    if (!isAnalyticsReady) return;
    simpleTrackCustomEvent(customData);
  },
  [isAnalyticsReady]
);
```

4. **Update Firestore schema** in `analytics-data.ts`:

```typescript
export const AnalyticsEventFirestoreSchema = z.object({
  eventType: z.enum([
    // ... existing types
    'custom_event',
  ]),
  // ... rest of schema
});
```

### Adding New Traffic Sources

Update `getTrafficSourceData()` in `analytics-simple.ts`:

```typescript
// Add new platform detection
else if (referrerDomain.includes('pinterest')) {
  trafficSource = 'pinterest';
  trafficMedium = 'social';
}
```

---

## 📊 Performance Impact

### Client-Side Performance

- **Bundle Size**: ~15KB (gzipped)
- **Load Time**: < 50ms (lazy-loaded)
- **Runtime Overhead**: < 5ms per event
- **Network Requests**: Batched to GA4

### Server-Side Performance

- **Firestore Writes**: Async, non-blocking
- **Read Queries**: Optimized with indexes
- **Aggregation**: Computed on-demand

---

## 🐛 Troubleshooting

### Analytics Not Tracking

**Check 1**: Consent given?

```typescript
// Open browser console
localStorage.getItem('gdpr-consent');
// Should return: '{"analytics":true}'
```

**Check 2**: Firebase initialized?

```typescript
// Check browser console for initialization message
// Should see: "✅ Analytics initialized"
```

**Check 3**: Environment variables set?

```bash
# Verify Firebase config exists
echo $NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### Traffic Source Not Detected

**Issue**: UTM parameters not being captured
**Solution**: Ensure URL is properly formatted:

```
✅ Good: ?utm_source=instagram&utm_medium=story
❌ Bad:  ?utmsource=instagram  (missing underscore)
```

**Issue**: Referrer showing as "direct" when it shouldn't
**Solution**:

- Check referrer policy on linking site
- Verify HTTPS → HTTPS links (HTTP → HTTPS drops referrer)

### Admin Dashboard Empty

**Issue**: No data showing in dashboard
**Solution**:

1. Check Firestore rules allow admin read access
2. Verify admin authentication is working
3. Confirm events are being written to Firestore
4. Check date range filter in dashboard

---

## 📚 Related Documentation

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [UTM Parameter Guide](https://ga-dev-tools.google/campaign-url-builder/)
- [GDPR Compliance Guide](../GDPR_COMPLIANCE.md)

---

## 🔄 Version History

### v1.0.0 (2025-01-27)

- ✅ Initial implementation
- ✅ Traffic source tracking
- ✅ UTM parameter support
- ✅ Admin dashboard
- ✅ Unit tests
- ✅ GDPR compliance
- ✅ Documentation complete

---

## 🤝 Contributing

When adding new analytics features:

1. Update `SimpleAnalyticsService` with new tracking method
2. Add corresponding hook in `useAnalytics`
3. Update Firestore schemas if event structure changes
4. Add unit tests for new functionality
5. Update this documentation
6. Test GDPR compliance

---

## 📞 Support

For issues or questions:

- Check troubleshooting section above
- Review test files for usage examples
- Consult Firebase Analytics documentation
- Contact development team

---

**End of Documentation**
