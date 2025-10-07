jest.mock('firebase/firestore', () => {
  class MockTimestamp {
    private _date: Date;
    constructor(date: Date) {
      this._date = date;
    }
    static fromDate(date: Date) {
      return new MockTimestamp(date);
    }
    toDate() {
      return this._date;
    }
  }
  return { Timestamp: MockTimestamp };
});

import { aggregateAnalyticsEvents } from '@/services/analytics-data';
import { Timestamp } from 'firebase/firestore';

type Ev = any;

function makeEvent(partial: Partial<Ev>): Ev {
  return {
    eventType: 'page_view',
    eventData: {},
    sessionId: 's1',
    deviceType: 'desktop',
    userLanguage: 'es',
    timestamp: Timestamp.fromDate(new Date()),
    ...partial,
  } as Ev;
}

describe('analytics aggregation traffic', () => {
  it('aggregates traffic source and UTM breakdowns', async () => {
    const now = new Date();
    const events: Ev[] = [
      makeEvent({
        eventData: {
          traffic_source: 'instagram',
          traffic_medium: 'social',
          utm_source: 'instagram',
          utm_campaign: 'summer',
        },
      }),
      makeEvent({
        eventData: { traffic_source: 'google', traffic_medium: 'organic' },
      }),
      makeEvent({
        eventData: {
          traffic_source: 'instagram',
          utm_source: 'instagram',
          utm_campaign: 'summer',
        },
      }),
      makeEvent({
        eventData: {
          referrer_domain: 'facebook.com',
          traffic_source: 'facebook',
          traffic_medium: 'social',
        },
      }),
    ];

    const summary = await aggregateAnalyticsEvents(
      events as any,
      now,
      now,
      'daily'
    );

    expect(summary.trafficSourceBreakdown?.instagram).toBe(2);
    expect(summary.trafficSourceBreakdown?.google).toBe(1);
    expect(summary.trafficMediumBreakdown?.social).toBeGreaterThanOrEqual(2);
    expect(summary.utmSourceBreakdown?.instagram).toBe(2);
    expect(summary.utmCampaignBreakdown?.summer).toBe(2);
    expect(summary.referrerDomainBreakdown?.['facebook.com']).toBe(1);
  });
});
