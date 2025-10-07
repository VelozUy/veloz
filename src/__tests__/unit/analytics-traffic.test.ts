import { __parseTrafficSourceForTest } from '@/services/analytics-simple';

describe('Traffic source parsing', () => {
  it('parses UTM instagram story', () => {
    const url =
      'https://example.com/?utm_source=instagram&utm_medium=story&utm_campaign=summer';
    const data = __parseTrafficSourceForTest({ url });
    expect(data.traffic_source).toBe('instagram');
    expect(data.traffic_medium).toBe('story');
    expect(data.traffic_campaign).toBe('summer');
    expect(data.utm_source).toBe('instagram');
  });

  it('detects google organic from referrer', () => {
    const url = 'https://example.com/';
    const ref = 'https://www.google.com/search?q=test';
    const data = __parseTrafficSourceForTest({ url, referrer: ref });
    expect(data.traffic_source).toBe('google');
    expect(data.traffic_medium).toBe('organic');
    expect(data.referrer_domain).toContain('google');
  });

  it('falls back to referral for unknown domain', () => {
    const url = 'https://example.com/';
    const ref = 'https://blog.partner-site.co/article';
    const data = __parseTrafficSourceForTest({ url, referrer: ref });
    expect(data.traffic_source).toBe('referral');
    expect(data.traffic_medium).toBe('referral');
  });

  it('treats missing utm/referrer as direct', () => {
    const url = 'https://example.com/landing';
    const data = __parseTrafficSourceForTest({ url });
    expect(data.traffic_source).toBe('direct');
    expect(data.traffic_medium).toBe('none');
    expect(data.landing_page).toBe('/landing');
  });
});
