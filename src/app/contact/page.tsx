import { Metadata } from 'next';
import { ContactForm } from '@/components/forms';

export const metadata: Metadata = {
  title:
    'Let&apos;s work together | Veloz - Professional Event Photography & Videography',
  description:
    'Ready to capture your special moment? Contact Veloz for professional event photography and videography services. Quick response, personalized service, and exceptional results.',
  openGraph: {
    title: 'Contact Veloz - Let&apos;s capture your special moment',
    description:
      'Ready to work together? Tell us about your event and let&apos;s create something amazing.',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Let&apos;s work{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                together
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Every event tells a unique story. We&apos;re here to capture yours
              with the professionalism, warmth, and creativity that makes Veloz
              special.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-6 sm:px-8">
          <ContactForm />
        </div>
      </div>

      {/* Trust Section */}
      <div className="border-t border-border py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Quick Response
              </h3>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours with a personalized quote
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                No Commitment
              </h3>
              <p className="text-sm text-muted-foreground">
                Getting a quote is completely free with no strings attached
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Privacy First
              </h3>
              <p className="text-sm text-muted-foreground">
                We never share your information and only contact you about your
                event
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
