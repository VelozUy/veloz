import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FastForwardUnderline } from '@/components/ui/animated-underline';

// Support both static content FAQ structure and service FAQ structure
interface StaticFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface ServiceFAQ {
  id: string;
  question: {
    en: string;
    es: string;
    pt: string;
  };
  answer: {
    en: string;
    es: string;
    pt: string;
  };
  order: number;
  published: boolean;
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

export type FAQ = StaticFAQ | ServiceFAQ;

interface FAQItemProps {
  faq: FAQ;
  locale?: string;
}

function getFAQText(
  faq: FAQ,
  field: 'question' | 'answer',
  locale: string = 'es'
): string {
  const content = faq[field];

  // Handle static content FAQ structure (string)
  if (typeof content === 'string') {
    return content;
  }

  // Handle service FAQ structure (localized object)
  if (content && typeof content === 'object') {
    return (
      content[locale as keyof typeof content] || content.es || content.en || ''
    );
  }

  return '';
}

export default function FAQItem({ faq, locale = 'es' }: FAQItemProps) {
  return (
    <AccordionItem
      value={faq.id}
      className="border bg-card text-card-foreground rounded-none px-4 border-border shadow-sm last:border-b"
    >
      <AccordionTrigger className="text-left font-subtitle font-bold hover:text-primary transition-colors py-4 text-card-foreground text-lg group relative no-underline hover:no-underline [&:not([data-state=open])]:text-decoration-none [&:not([data-state=open])]:hover:text-decoration-none">
        <span className="relative">
          {getFAQText(faq, 'question', locale)}
          <FastForwardUnderline isActive={false} color="current" />
        </span>
      </AccordionTrigger>
      <AccordionContent className="text-lg pb-4 pt-2 text-card-foreground font-body">
        <div
          dangerouslySetInnerHTML={{
            __html: getFAQText(faq, 'answer', locale),
          }}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
