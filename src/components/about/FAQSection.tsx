import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

type FAQ = StaticFAQ | ServiceFAQ;

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
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

export default function FAQSection({
  faqs,
  title = 'Preguntas Frecuentes',
  locale = 'es',
}: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const [left, right] = useMemo(() => {
    const leftCol: FAQ[] = [];
    const rightCol: FAQ[] = [];
    faqs.forEach((f, i) => (i % 2 === 0 ? leftCol.push(f) : rightCol.push(f)));
    return [leftCol, rightCol];
  }, [faqs]);

  const leftIds = useMemo(() => new Set(left.map(f => f.id)), [left]);
  const rightIds = useMemo(() => new Set(right.map(f => f.id)), [right]);

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 sm:px-8 lg:px-16 bg-muted/30">
      <div className="max-w-border-64 mx-auto space-y-8">
        <div className="text-left">
          <h2 className="text-section-title-md font-title font-bold mb-4 text-foreground uppercase">
            {title}
          </h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Mobile: single accordion preserves source order */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map(faq => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border bg-card text-card-foreground rounded-none px-4 border-border shadow-sm"
              >
                <AccordionTrigger className="text-left font-subtitle font-bold hover:text-primary transition-colors py-4 text-card-foreground">
                  {getFAQText(faq, 'question', locale)}
                </AccordionTrigger>
                <AccordionContent className="text-body-lg pb-4 pt-2 text-card-foreground font-body">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getFAQText(faq, 'answer', locale),
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Desktop: two independent accordions, coordinated to allow only one open globally */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6">
          <Accordion
            type="single"
            collapsible
            value={leftIds.has(openId as any) ? openId : undefined}
            onValueChange={val => setOpenId((val as string) || undefined)}
            className="w-full space-y-4"
          >
            {left.map(faq => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border bg-card text-card-foreground rounded-none px-4 border-border shadow-sm"
              >
                <AccordionTrigger className="text-left font-subtitle font-bold hover:text-primary transition-colors py-4 text-card-foreground">
                  {getFAQText(faq, 'question', locale)}
                </AccordionTrigger>
                <AccordionContent className="text-body-lg pb-4 pt-2 text-card-foreground font-body">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getFAQText(faq, 'answer', locale),
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Accordion
            type="single"
            collapsible
            value={rightIds.has(openId as any) ? openId : undefined}
            onValueChange={val => setOpenId((val as string) || undefined)}
            className="w-full space-y-4"
          >
            {right.map(faq => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border bg-card text-card-foreground rounded-none px-4 border-border shadow-sm"
              >
                <AccordionTrigger className="text-left font-subtitle font-bold hover:text-primary transition-colors py-4 text-card-foreground">
                  {getFAQText(faq, 'question', locale)}
                </AccordionTrigger>
                <AccordionContent className="text-body-lg pb-4 pt-2 text-card-foreground font-body">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getFAQText(faq, 'answer', locale),
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
