import React from 'react';
import { render } from '@testing-library/react';
import MediaLightbox from '../MediaLightbox';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Dialog components from shadcn/ui
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Play: () => <div data-testid="play-icon" />,
  Share2: () => <div data-testid="share-icon" />,
}));

// Mock useAnalytics hook
const mockTrackMediaInteraction = jest.fn();
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackMediaInteraction: mockTrackMediaInteraction,
  }),
}));

describe('MediaLightbox Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls trackMediaInteraction when opened with photo', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={[
          { 
            id: 'm1', 
            type: 'photo', 
            url: 'url', 
            caption: { en: 'caption' },
            aspectRatio: '16:9'
          },
        ]}
        projects={{ 
          m1: { 
            id: 'p1', 
            title: { en: 'Project', es: 'Project', he: 'Project' }, 
            eventType: 'wedding', 
            eventDate: '2024-01-01' 
          } 
        }}
        currentIndex={0}
        onNavigate={() => {}}
      />
    );

    expect(mockTrackMediaInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'p1',
        mediaId: 'm1',
        mediaType: 'image',
        interactionType: 'view',
        mediaTitle: 'caption',
      })
    );
  });

  it('calls trackMediaInteraction when opened with video', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={[
          { 
            id: 'm2', 
            type: 'video', 
            url: 'video-url', 
            caption: { en: 'video caption' },
            aspectRatio: '16:9'
          },
        ]}
        projects={{ 
          m2: { 
            id: 'p2', 
            title: { en: 'Video Project', es: 'Video Project', he: 'Video Project' }, 
            eventType: 'corporate', 
            eventDate: '2024-02-01' 
          } 
        }}
        currentIndex={0}
        onNavigate={() => {}}
      />
    );

    expect(mockTrackMediaInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'p2',
        mediaId: 'm2',
        mediaType: 'video',
        interactionType: 'view',
        mediaTitle: 'video caption',
      })
    );
  });

  it('does not call trackMediaInteraction when closed', () => {
    render(
      <MediaLightbox
        isOpen={false}
        onClose={() => {}}
        media={[
          { 
            id: 'm1', 
            type: 'photo', 
            url: 'url', 
            caption: { en: 'caption' },
            aspectRatio: '16:9'
          },
        ]}
        projects={{ 
          m1: { 
            id: 'p1', 
            title: { en: 'Project', es: 'Project', he: 'Project' }, 
            eventType: 'wedding', 
            eventDate: '2024-01-01' 
          } 
        }}
        currentIndex={0}
        onNavigate={() => {}}
      />
    );

    expect(mockTrackMediaInteraction).not.toHaveBeenCalled();
  });
}); 