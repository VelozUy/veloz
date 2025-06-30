import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock user data for testing
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

// Mock authenticated user context
export const mockAuthContextValue = {
  user: mockUser,
  loading: false,
  signOut: jest.fn(),
};

// Mock unauthenticated user context
export const mockUnauthenticatedContextValue = {
  user: null,
  loading: false,
  signOut: jest.fn(),
};

// Custom render function with providers

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="test-wrapper">{children}</div>;
};

export const customRender = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

// Helper function to create mock FAQ data
export const createMockFAQ = (overrides = {}) => ({
  id: 'faq-1',
  question: {
    es: '¿Qué tipo de eventos cubren?',
    en: 'What types of events do you cover?',
    pt: 'Que tipos de eventos vocês cobrem?',
  },
  answer: {
    es: 'Cubrimos todo tipo de eventos: bodas, cumpleaños, eventos corporativos...',
    en: 'We cover all types of events: weddings, birthdays, corporate events...',
    pt: 'Cobrimos todos os tipos de eventos: casamentos, aniversários, eventos corporativos...',
  },
  category: 'General',
  order: 1,
  published: true,
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
  ...overrides,
});

// Helper function to create mock project data
export const createMockProject = (overrides = {}) => ({
  id: 'project-1',
  title: {
    es: 'Boda María & Juan',
    en: 'María & Juan Wedding',
    pt: 'Casamento María & Juan',
  },
  description: {
    es: 'Una hermosa ceremonia al aire libre',
    en: 'A beautiful outdoor ceremony',
    pt: 'Uma bela cerimônia ao ar livre',
  },
  eventType: 'wedding',
  status: 'published',
  tags: ['wedding', 'outdoor'],
  coverImage: 'https://example.com/cover.jpg',
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
  ...overrides,
});

// Helper function to create mock media data
export const createMockMedia = (overrides = {}) => ({
  id: 'media-1',
  type: 'photo',
  url: 'https://example.com/photo.jpg',
  title: {
    es: 'Foto de boda',
    en: 'Wedding photo',
    pt: 'Foto de casamento',
  },
  description: {
    es: 'Una hermosa foto de la ceremonia',
    en: 'A beautiful photo of the ceremony',
    pt: 'Uma bela foto da cerimônia',
  },
  caption: {
    es: 'Momento especial',
    en: 'Special moment',
    pt: 'Momento especial',
  },
  tags: ['wedding', 'ceremony'],
  featured: false,
  aspectRatio: '16:9',
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
  ...overrides,
});

// Helper function to create mock homepage content
export const createMockHomepageContent = (overrides = {}) => ({
  headline: {
    es: 'Capturamos momentos únicos',
    en: 'We capture unique moments',
    pt: 'Capturamos momentos únicos',
  },
  subtitle: {
    es: 'Fotografía y video profesional para eventos',
    en: 'Professional photography and video for events',
    pt: 'Fotografia e vídeo profissional para eventos',
  },
  ctaButton: {
    es: 'Ver nuestro trabajo',
    en: 'See our work',
    pt: 'Veja nosso trabalho',
  },
  backgroundVideo: 'https://example.com/bg-video.mp4',
  logo: 'https://example.com/logo.png',
  ...overrides,
});

// Wait for async operations to complete
export const waitForAsyncOperations = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock Firebase service responses
export const mockFirebaseResponse = {
  success: { success: true, data: {} },
  error: { success: false, error: 'Test error' },
  loading: { success: false, loading: true },
};

// Mock translation service responses
export const mockTranslationResponse = {
  success: 'Translated text',
  error: null,
};

// Helper to simulate user interactions
export const userInteraction = {
  type: async (element: HTMLElement, text: string) => {
    const user = userEvent.setup();
    await user.type(element, text);
  },
  click: async (element: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(element);
  },
  selectOption: async (element: HTMLElement, option: string) => {
    const user = userEvent.setup();
    await user.selectOptions(element, option);
  },
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
