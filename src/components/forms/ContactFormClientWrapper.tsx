'use client';

import dynamic from 'next/dynamic';

// Dynamically import the animated component to avoid SSR issues
const ContactFormAnimatedClient = dynamic(
  () => import('@/components/forms/ContactFormAnimatedSimple'),
  { ssr: false }
);

interface ContactFormClientWrapperProps {
  translations: any;
  locale: string;
}

export default function ContactFormClientWrapper({
  translations,
  locale,
}: ContactFormClientWrapperProps) {
  return (
    <ContactFormAnimatedClient translations={translations} locale={locale} />
  );
}
