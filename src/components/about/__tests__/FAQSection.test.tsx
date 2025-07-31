import React from 'react';
import { render, screen } from '@testing-library/react';
import FAQSection from '../FAQSection';



describe('FAQSection', () => {
  const mockFAQs = [
    {
      id: '1',
      question: 'What is your service?',
      answer: 'We provide photography services.',
      order: 1
    },
    {
      id: '2',
      question: 'How much do you charge?',
      answer: 'Our prices vary by package.',
      order: 2
    },
    {
      id: '3',
      question: 'What equipment do you use?',
      answer: 'We use professional cameras.',
      order: 3
    }
  ];

  const mockServiceFAQs = [
    {
      id: '1',
      question: {
        en: 'What is your service?',
        es: '¿Cuál es tu servicio?',
        pt: 'Qual é o seu serviço?'
      },
      answer: {
        en: 'We provide photography services.',
        es: 'Proporcionamos servicios de fotografía.',
        pt: 'Fornecemos serviços de fotografia.'
      },
      order: 1,
      published: true,
      createdAt: null,
      updatedAt: null
    }
  ];

  it('renders FAQ section with title', () => {
    render(
      <FAQSection 
        faqs={mockFAQs}
        title="Test FAQs"
        locale="en"
      />
    );

    expect(screen.getByText('Test FAQs')).toBeInTheDocument();
  });

  it('renders FAQs in simple accordion layout', () => {
    render(
      <FAQSection 
        faqs={mockFAQs}
        title="Test FAQs"
        locale="en"
      />
    );

    expect(screen.getByText('What is your service?')).toBeInTheDocument();
    expect(screen.getByText('How much do you charge?')).toBeInTheDocument();
    expect(screen.getByText('What equipment do you use?')).toBeInTheDocument();
  });

  it('handles service FAQ structure correctly', () => {
    render(
      <FAQSection 
        faqs={mockServiceFAQs}
        title="Test FAQs"
        locale="en"
      />
    );

    expect(screen.getByText('What is your service?')).toBeInTheDocument();
  });

  it('handles service FAQ structure with Spanish locale', () => {
    render(
      <FAQSection 
        faqs={mockServiceFAQs}
        title="Test FAQs"
        locale="es"
      />
    );

    expect(screen.getByText('¿Cuál es tu servicio?')).toBeInTheDocument();
  });

  it('returns null when no FAQs provided', () => {
    const { container } = render(
      <FAQSection 
        faqs={[]}
        title="Test FAQs"
        locale="en"
      />
    );

    expect(container.firstChild).toBeNull();
  });


}); 