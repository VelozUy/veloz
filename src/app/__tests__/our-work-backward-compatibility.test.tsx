import { notFound, redirect } from 'next/navigation';
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

describe('Our Work Backward Compatibility Integration Tests', () => {
  const mockGetStaticContent = getStaticContent as jest.MockedFunction<
    typeof getStaticContent
  >;
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real-world backward compatibility scenarios', () => {
    it('should handle legacy ID-based URLs and redirect to slug-based URLs', async () => {
      // Mock realistic project data with mixed slug/ID scenarios
      mockGetStaticContent.mockReturnValue({
        locale: 'es',
        translations: {},
        content: {
          projects: [
            {
              id: 'proj_legacy_001',
              slug: 'boda-maria-y-juan-2024',
              title: 'Boda de María y Juan',
              description: 'Una hermosa boda en Montevideo',
              tags: ['boda', 'montevideo', '2024'],
              eventType: 'Casamiento',
              location: 'Montevideo',
              eventDate: '2024-06-15',
              featured: true,
              status: 'published',
              media: [],
              mediaBlocks: [],
              detailPageBlocks: [],
              detailPageGridHeight: 9,
            },
            {
              id: 'proj_legacy_002',
              slug: undefined, // Legacy project without slug
              title: 'Evento Corporativo ABC',
              description: 'Evento empresarial importante',
              tags: ['corporativo', 'empresarial'],
              eventType: 'Corporativos',
              location: 'Punta del Este',
              eventDate: '2024-07-20',
              featured: false,
              status: 'published',
              media: [],
              mediaBlocks: [],
              detailPageBlocks: [],
              detailPageGridHeight: 9,
            },
            {
              id: 'proj_legacy_003',
              slug: 'evento-empresarial-abc',
              title: 'Evento Empresarial ABC',
              description: 'Otro evento corporativo',
              tags: ['corporativo', 'abc'],
              eventType: 'Corporativos',
              location: 'Montevideo',
              eventDate: '2024-08-10',
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

      // Import the page component
      const { default: ProjectDetailPage } = await import(
        '../our-work/[slug]/page'
      );

      // Test 1: Legacy ID-based URL should redirect to slug-based URL
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'proj_legacy_001' }),
      });

      expect(mockRedirect).toHaveBeenCalledWith(
        '/our-work/boda-maria-y-juan-2024'
      );

      // Reset mock
      jest.clearAllMocks();

      // Test 2: Legacy project without slug should work without redirect
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'proj_legacy_002' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();

      // Reset mock
      jest.clearAllMocks();

      // Test 3: Direct slug access should work without redirect
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'evento-empresarial-abc' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should handle edge cases in backward compatibility', async () => {
      // Mock edge case scenarios
      mockGetStaticContent.mockReturnValue({
        locale: 'es',
        translations: {},
        content: {
          projects: [
            {
              id: 'same-as-slug',
              slug: 'same-as-slug', // ID equals slug
              title: 'Project with ID same as slug',
              description: 'Edge case test',
              tags: [],
              eventType: 'Otros',
              location: 'Montevideo',
              eventDate: '2024-01-01',
              featured: false,
              status: 'published',
              media: [],
              mediaBlocks: [],
              detailPageBlocks: [],
              detailPageGridHeight: 9,
            },
            {
              id: 'proj_with_special_chars',
              slug: 'proyecto-con-caracteres-especiales',
              title: 'Proyecto con Caracteres Especiales',
              description: 'Test with special characters',
              tags: [],
              eventType: 'Otros',
              location: 'Montevideo',
              eventDate: '2024-01-01',
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

      // Import the page component
      const { default: ProjectDetailPage } = await import(
        '../our-work/[slug]/page'
      );

      // Test 1: ID equals slug - should not redirect
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'same-as-slug' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();

      // Reset mock
      jest.clearAllMocks();

      // Test 2: Access by ID when ID equals slug - should not redirect
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'same-as-slug' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();

      // Reset mock
      jest.clearAllMocks();

      // Test 3: Access by slug with special characters
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'proyecto-con-caracteres-especiales' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should handle migration scenarios gracefully', async () => {
      // Mock migration scenario where some projects have slugs and others don't
      mockGetStaticContent.mockReturnValue({
        locale: 'es',
        translations: {},
        content: {
          projects: [
            {
              id: 'migrated_project_1',
              slug: 'boda-ana-y-carlos',
              title: 'Boda de Ana y Carlos',
              description: 'Boda migrada con slug',
              tags: [],
              eventType: 'Casamiento',
              location: 'Montevideo',
              eventDate: '2024-01-01',
              featured: false,
              status: 'published',
              media: [],
              mediaBlocks: [],
              detailPageBlocks: [],
              detailPageGridHeight: 9,
            },
            {
              id: 'not_migrated_project_1',
              slug: undefined, // Not yet migrated
              title: 'Evento Sin Migrar',
              description: 'Proyecto sin slug aún',
              tags: [],
              eventType: 'Otros',
              location: 'Montevideo',
              eventDate: '2024-01-01',
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

      // Import the page component
      const { default: ProjectDetailPage } = await import(
        '../our-work/[slug]/page'
      );

      // Test 1: Migrated project accessed by ID should redirect to slug
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'migrated_project_1' }),
      });

      expect(mockRedirect).toHaveBeenCalledWith('/our-work/boda-ana-y-carlos');

      // Reset mock
      jest.clearAllMocks();

      // Test 2: Non-migrated project accessed by ID should work without redirect
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'not_migrated_project_1' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();

      // Reset mock
      jest.clearAllMocks();

      // Test 3: Migrated project accessed by slug should work without redirect
      await ProjectDetailPage({
        params: Promise.resolve({ slug: 'boda-ana-y-carlos' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should handle SEO and metadata correctly for both URL types', async () => {
      // Mock project data for metadata testing
      mockGetStaticContent.mockReturnValue({
        locale: 'es',
        translations: {},
        content: {
          projects: [
            {
              id: 'seo_test_project',
              slug: 'evento-seo-test',
              title: 'Evento SEO Test',
              description: 'Descripción para SEO',
              tags: ['seo', 'test'],
              eventType: 'Otros',
              location: 'Montevideo',
              eventDate: '2024-01-01',
              featured: true,
              status: 'published',
              media: [
                {
                  id: 'media1',
                  projectId: 'seo_test_project',
                  url: 'https://example.com/image1.jpg',
                  type: 'photo',
                  order: 1,
                },
                {
                  id: 'media2',
                  projectId: 'seo_test_project',
                  url: 'https://example.com/image2.jpg',
                  type: 'photo',
                  order: 2,
                },
              ],
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

      // Import the metadata function
      const { generateMetadata } = await import('../our-work/[slug]/page');

      // Test 1: Metadata for slug-based URL
      const slugMetadata = await generateMetadata({
        params: Promise.resolve({ slug: 'evento-seo-test' }),
      });

      expect(slugMetadata).toEqual({
        title: 'Evento SEO Test - Veloz',
        description: 'Descripción para SEO',
        openGraph: {
          title: 'Evento SEO Test',
          description: 'Descripción para SEO',
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
      });

      // Test 2: Metadata for ID-based URL (should be same as slug-based)
      const idMetadata = await generateMetadata({
        params: Promise.resolve({ slug: 'seo_test_project' }),
      });

      expect(idMetadata).toEqual({
        title: 'Evento SEO Test - Veloz',
        description: 'Descripción para SEO',
        openGraph: {
          title: 'Evento SEO Test',
          description: 'Descripción para SEO',
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
      });
    });
  });
});
