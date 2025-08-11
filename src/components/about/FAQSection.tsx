'use client';

import React, { useMemo, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import FAQItem from './FAQItem';

// Import types from FAQItem component
import type { FAQ } from './FAQItem';

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  locale?: string;
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
      <div className="max-w-border-64 mx-auto space-y-8 pb-4">
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
              <FAQItem key={faq.id} faq={faq} locale={locale} />
            ))}
          </Accordion>
          <div className="h-4"></div>
        </div>

        {/* Desktop: two independent accordions, coordinated to allow only one open globally */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6">
          <div>
            <Accordion
              type="single"
              collapsible
              value={leftIds.has(openId as any) ? openId : undefined}
              onValueChange={val => setOpenId((val as string) || undefined)}
              className="w-full space-y-4"
            >
              {left.map(faq => (
                <FAQItem key={faq.id} faq={faq} locale={locale} />
              ))}
            </Accordion>
            <div className="h-4"></div>
          </div>

          <div>
            <Accordion
              type="single"
              collapsible
              value={rightIds.has(openId as any) ? openId : undefined}
              onValueChange={val => setOpenId((val as string) || undefined)}
              className="w-full space-y-4"
            >
              {right.map(faq => (
                <FAQItem key={faq.id} faq={faq} locale={locale} />
              ))}
            </Accordion>
            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
