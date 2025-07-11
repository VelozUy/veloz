import { render, screen } from '@testing-library/react';
import MediaLightbox from '../MediaLightbox';

// Mock the useAnalytics hook
const mockTrackMediaInteraction = jest.fn();

jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackMediaInteraction: mockTrackMediaInteraction,
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => 
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
  Pause: () => <div data-testid="pause-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  ZoomIn: () => <div data-testid="zoom-in-icon" />,
  ZoomOut: () => <div data-testid="zoom-out-icon" />,
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

  it('tracks media interaction with correct project and media data', () => {
    const testMedia = [
      { 
        id: 'test-media-123', 
        type: 'photo' as const, 
        url: 'test-url', 
        caption: { en: 'Test Caption', es: 'Test Caption', he: 'Test Caption' },
        aspectRatio: '16:9' as const
      },
    ];

    const testProjects = {
      'test-media-123': { 
        id: 'test-project-456', 
        title: { en: 'Test Project', es: 'Test Project', he: 'Test Project' }, 
        eventType: 'wedding', 
        eventDate: '2024-03-01' 
      } 
    };

    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={testMedia}
        projects={testProjects}
        currentIndex={0}
        onNavigate={() => {}}
      />
    );

    expect(mockTrackMediaInteraction).toHaveBeenCalledWith({
      projectId: 'test-project-456',
      mediaId: 'test-media-123',
      mediaType: 'image',
      interactionType: 'view',
      mediaTitle: 'Test Caption',
    });
  });
}); 