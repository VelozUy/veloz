import { notFound } from 'next/navigation';
import {
  generateStaticParams,
  generateMetadata,
} from '../our-work/[slug]/page';
import { getStaticContent } from '@/lib/utils';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
  usePathname: jest.fn(() => '/test-path'),
}));

// Mock the utils module
jest.mock('@/lib/utils', () => ({
  getStaticContent: jest.fn(),
}));

// Mock Firebase to prevent initialization errors
jest.mock('@/lib/firebase', () => ({
  initializeFirebase: jest.fn(),
  getFirestore: jest.fn(),
}));

// Mock all Firebase services
jest.mock('@/services/crew-member', () => ({
  getCrewMembers: jest.fn(() => Promise.resolve([])),
}));

// Mock components that depend on Firebase
jest.mock('@/components/our-work/ProjectDetailClient', () => {
  return function MockProjectDetailClient() {
    return (
      <div data-testid="project-detail-client">Mock Project Detail Client</div>
    );
  };
});

jest.mock('@/components/our-work/MeetTheTeam', () => {
  return function MockMeetTheTeam() {
    return <div data-testid="meet-the-team">Mock Meet The Team</div>;
  };
});

describe('Project Detail Page Slug Routing', () => {
  const mockGetStaticContent = getStaticContent as jest.MockedFunction<
    typeof getStaticContent
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock static content with test projects
    mockGetStaticContent.mockReturnValue({
      locale: 'es',
      translations: {},
      content: {
        projects: [
          {
            id: 'proj1',
            slug: 'boda-maria-y-juan',
            title: 'Boda de María y Juan',
            description: 'Una boda hermosa',
            tags: [],
            eventType: 'Casamiento',
            location: 'Montevideo',
            eventDate: '2024-01-15',
            featured: false,
            status: 'published',
            media: [],
            mediaBlocks: [],
            detailPageBlocks: [],
            detailPageGridHeight: 9,
          },
          {
            id: 'proj2',
            slug: undefined, // No slug for this project
            title: 'Evento Corporativo',
            description: 'Evento empresarial',
            tags: [],
            eventType: 'Corporativos',
            location: 'Montevideo',
            eventDate: '2024-02-20',
            featured: false,
            status: 'published',
            media: [],
            mediaBlocks: [],
            detailPageBlocks: [],
            detailPageGridHeight: 9,
          },
        ],
        homepage: { headline: '', logo: {}, backgroundVideo: {} },
        about: {
          title: '',
          subtitle: '',
          philosophy: { title: '', description: '' },
          methodology: {
            title: '',
            planning: { title: '', description: '' },
            coverage: { title: '', description: '' },
            capture: { title: '', description: '' },
            postproduction: { title: '', description: '' },
          },
          values: {
            title: '',
            passion: { title: '', description: '' },
            teamwork: { title: '', description: '' },
            quality: { title: '', description: '' },
            agility: { title: '', description: '' },
            excellence: { title: '', description: '' },
            trust: { title: '', description: '' },
          },
          faq: { title: '' },
        },
        faqs: [],
      },
      lastUpdated: '',
      buildTime: true,
    });
  });

  describe('generateStaticParams', () => {
    it('should generate static params for all projects with slugs', async () => {
      const params = await generateStaticParams();

      expect(params).toEqual([
        { slug: 'boda-maria-y-juan' },
        { slug: 'proj2' }, // Fallback to ID when no slug
      ]);
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata for project found by slug', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'boda-maria-y-juan' }),
      });

      expect(metadata).toEqual({
        title: 'Boda de María y Juan - Veloz',
        description: 'Una boda hermosa',
        openGraph: {
          title: 'Boda de María y Juan',
          description: 'Una boda hermosa',
          images: [],
        },
      });
    });

    it('should generate metadata for project found by ID', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'proj2' }),
      });

      expect(metadata).toEqual({
        title: 'Evento Corporativo - Veloz',
        description: 'Evento empresarial',
        openGraph: {
          title: 'Evento Corporativo',
          description: 'Evento empresarial',
          images: [],
        },
      });
    });

    it('should return not found metadata for non-existent project', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'non-existent' }),
      });

      expect(metadata).toEqual({
        title: 'Project Not Found',
      });
    });
  });

  describe('Slug-based routing logic', () => {
    it('should find project by slug', async () => {
      const content = mockGetStaticContent();
      const project = content.content.projects.find(
        p => p.slug === 'boda-maria-y-juan'
      );

      expect(project).toBeDefined();
      expect(project?.title).toBe('Boda de María y Juan');
    });

    it('should find project by ID when slug is undefined', async () => {
      const content = mockGetStaticContent();
      const project = content.content.projects.find(p => p.id === 'proj2');

      expect(project).toBeDefined();
      expect(project?.title).toBe('Evento Corporativo');
      expect(project?.slug).toBeUndefined();
    });

    it('should not find non-existent project', async () => {
      const content = mockGetStaticContent();
      const project = content.content.projects.find(
        p => p.slug === 'non-existent' || p.id === 'non-existent'
      );

      expect(project).toBeUndefined();
    });
  });
});
