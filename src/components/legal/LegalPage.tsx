import { Metadata } from 'next';
import { getBackgroundClasses } from '@/lib/background-utils';
import { cn } from '@/lib/utils';
import { getStaticContent, t } from '@/lib/utils';
import { BUSINESS_CONFIG } from '@/lib/business-config';

interface LegalPageProps {
  locale: string;
  pageType: 'privacy' | 'terms' | 'cookies';
}

export function LegalPage({ locale, pageType }: LegalPageProps) {
  const backgroundClasses = getBackgroundClasses('content', 'high');
  const content = getStaticContent(locale);

  const getPageTitle = () => {
    switch (pageType) {
      case 'privacy':
        return t(content, 'legal.privacy.title', 'Privacy Policy');
      case 'terms':
        return t(content, 'legal.terms.title', 'Terms of Service');
      case 'cookies':
        return t(content, 'legal.cookies.title', 'Cookies Settings');
    }
  };

  const getPageDescription = () => {
    switch (pageType) {
      case 'privacy':
        return t(
          content,
          'legal.privacy.description',
          'Privacy policy and data protection information.'
        );
      case 'terms':
        return t(
          content,
          'legal.terms.description',
          'Terms and conditions of service.'
        );
      case 'cookies':
        return t(
          content,
          'legal.cookies.description',
          'Cookie settings and management.'
        );
    }
  };

  const getPageContent = () => {
    switch (pageType) {
      case 'privacy':
        return (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.privacy.sections.collect.title',
                  'Information We Collect'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.privacy.sections.collect.intro',
                  'We collect information that you provide directly to us, such as when:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.collect.items.form',
                    'You complete our contact form'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.collect.items.email',
                    'You send us an email'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.collect.items.phone',
                    'You contact us by phone or WhatsApp'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.collect.items.services',
                    'You use our services'
                  )}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.privacy.sections.use.title',
                  'How We Use Your Information'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.privacy.sections.use.intro',
                  'We use the information we collect to:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.use.items.respond',
                    'Respond to your inquiries and requests'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.use.items.provide',
                    'Provide our photography and video services'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.use.items.communicate',
                    'Communicate with you about our services'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.use.items.improve',
                    'Improve our services and customer experience'
                  )}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.privacy.sections.protection.title',
                  'Data Protection'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.privacy.sections.protection.content',
                  'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.privacy.sections.rights.title',
                  'Your Rights'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.privacy.sections.rights.intro',
                  'You have the right to:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.rights.items.access',
                    'Access the personal information we have about you'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.rights.items.correct',
                    'Correct inaccurate or incomplete information'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.rights.items.delete',
                    'Request deletion of your personal information'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.privacy.sections.rights.items.object',
                    'Object to the processing of your personal information'
                  )}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.privacy.sections.changes.title',
                  'Changes to This Policy'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.privacy.sections.changes.content',
                  'We may update this privacy policy occasionally. We will notify you of any significant changes by posting the new policy on our website.'
                )}
              </p>
            </section>
          </>
        );

      case 'terms':
        return (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.acceptance.title',
                  'Acceptance of Terms'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.acceptance.content',
                  'By using our photography and video services, you agree to be bound by these terms and conditions. If you do not agree to any part of these terms, you should not use our services.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.services.title',
                  'Service Description'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.services.intro',
                  'Veloz provides professional photography and videography services for events, including but not limited to:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  {t(
                    content,
                    'legal.terms.sections.services.items.corporate',
                    'Corporate event photography'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.services.items.videography',
                    'Professional videography'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.services.items.weddings',
                    'Wedding and social event photography'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.services.items.editing',
                    'Editing and post-production'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.services.items.delivery',
                    'Delivery of digital and physical materials'
                  )}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.payments.title',
                  'Bookings and Payments'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.payments.content',
                  'Bookings are confirmed with a 50% deposit of the total service value. The remaining payment must be made before delivery of the final material. Prices are subject to change without notice.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.cancellations.title',
                  'Cancellations and Refunds'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.cancellations.content',
                  'Cancellations with more than 7 days notice will receive a full refund of the deposit. Cancellations with less than 7 days notice are non-refundable. In case of cancellation by Veloz, a full refund will be provided.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.copyright.title',
                  'Copyright'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.copyright.content',
                  'Veloz retains copyright of all images and videos produced. Clients receive a personal and commercial use license for delivered images. Modification or resale of images is not permitted without written authorization.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.delivery.title',
                  'Delivery Times'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.delivery.intro',
                  'Typical delivery times are:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  {t(
                    content,
                    'legal.terms.sections.delivery.items.photos',
                    'Photographs: 5-10 business days'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.delivery.items.videos',
                    'Videos: 10-15 business days'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.delivery.items.special',
                    'Special edits: according to complexity'
                  )}
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {t(
                  content,
                  'legal.terms.sections.delivery.note',
                  'Times may vary depending on project complexity and workload.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.responsibilities.title',
                  'Client Responsibilities'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.responsibilities.intro',
                  'The client commits to:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  {t(
                    content,
                    'legal.terms.sections.responsibilities.items.info',
                    'Provide accurate information about the event'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.responsibilities.items.access',
                    'Facilitate access to the event location'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.responsibilities.items.schedule',
                    'Respect agreed schedules'
                  )}
                </li>
                <li>
                  {t(
                    content,
                    'legal.terms.sections.responsibilities.items.safety',
                    'Provide a safe environment for the team'
                  )}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.terms.sections.liability.title',
                  'Limitation of Liability'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.terms.sections.liability.content',
                  'Veloz will not be responsible for indirect, incidental, or consequential damages that may result from the use of our services. Our total liability is limited to the amount paid for the services.'
                )}
              </p>
            </section>
          </>
        );

      case 'cookies':
        return (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.what.title',
                  'What are Cookies?'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.cookies.sections.what.content',
                  'Cookies are small text files that are stored on your device when you visit our website. They help us improve your browsing experience and understand how you use our site.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.types.title',
                  'Types of Cookies We Use'
                )}
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-4">
                {t(
                  content,
                  'legal.cookies.sections.types.intro',
                  'Our website primarily uses third-party services that may set cookies automatically. We do not use our own cookies for essential functionalities.'
                )}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">
                    {t(
                      content,
                      'legal.cookies.sections.types.none.title',
                      'No Own Cookies'
                    )}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      content,
                      'legal.cookies.sections.types.none.content',
                      'We do not set our own cookies on your device. All our functionalities use browser localStorage and sessionStorage, which are not cookies.'
                    )}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.thirdparty.title',
                  'Third-Party Cookies'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.cookies.sections.thirdparty.intro',
                  'We use third-party services that may set cookies automatically:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong>Firebase Analytics:</strong>{' '}
                  {t(
                    content,
                    'legal.cookies.sections.thirdparty.items.analytics',
                    'To analyze website traffic and understand how visitors use our site'
                  )}
                </li>
                <li>
                  <strong>Google Fonts:</strong>{' '}
                  {t(
                    content,
                    'legal.cookies.sections.thirdparty.items.fonts',
                    'To load typography fonts that improve the site appearance'
                  )}
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {t(
                  content,
                  'legal.cookies.sections.thirdparty.note',
                  'These services set cookies automatically and we cannot directly control which cookies they set.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.storage.title',
                  'Local Storage'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.cookies.sections.storage.intro',
                  'Instead of cookies, we use browser local storage:'
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong>localStorage:</strong>{' '}
                  {t(
                    content,
                    'legal.cookies.sections.storage.items.localStorage',
                    'To save user preferences (language, GDPR consent)'
                  )}
                </li>
                <li>
                  <strong>sessionStorage:</strong>{' '}
                  {t(
                    content,
                    'legal.cookies.sections.storage.items.sessionStorage',
                    'For temporary session data'
                  )}
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {t(
                  content,
                  'legal.cookies.sections.storage.note',
                  'This data is stored in your browser and is not automatically sent to our servers.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.management.title',
                  'Cookie Management'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.cookies.sections.management.intro',
                  'You can control third-party cookies in several ways:'
                )}
              </p>

              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">
                    {t(
                      content,
                      'legal.cookies.sections.management.browser.title',
                      'Browser Settings'
                    )}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      content,
                      'legal.cookies.sections.management.browser.content',
                      'Most browsers allow you to see what cookies you have and delete them individually or block them from specific sites or all sites.'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">
                    {t(
                      content,
                      'legal.cookies.sections.management.preferences.title',
                      'Preference Settings'
                    )}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      content,
                      'legal.cookies.sections.management.preferences.content',
                      'You can set your browser to reject all cookies or to indicate when a cookie is being sent.'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">
                    {t(
                      content,
                      'legal.cookies.sections.management.storage.title',
                      'Clear Local Storage'
                    )}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      content,
                      'legal.cookies.sections.management.storage.content',
                      'To remove our locally stored data, you can clear browser storage in privacy settings.'
                    )}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.impact.title',
                  'Impact of Disabling Cookies'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.cookies.sections.impact.content',
                  'If you disable third-party cookies, some functionalities like typography fonts may not load properly. The site will continue to work, but the visual experience may be affected.'
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(
                  content,
                  'legal.cookies.sections.updates.title',
                  'Updates to This Policy'
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.cookies.sections.updates.content',
                  'We may update this cookie policy occasionally. We recommend reviewing this page periodically to stay informed about how we use cookies.'
                )}
              </p>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'max-w-4xl mx-auto space-y-8',
            backgroundClasses.background,
            backgroundClasses.text,
            backgroundClasses.border,
            backgroundClasses.shadow,
            'p-8 md:p-12'
          )}
        >
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">{getPageTitle()}</h1>
            <div className="w-24 h-1 bg-primary rounded-full"></div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            {getPageContent()}

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t(content, 'legal.contact.title', 'Contact')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  content,
                  'legal.contact.intro',
                  'If you have questions about this policy, contact us at:'
                )}
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Veloz</p>
                <p>Email: {BUSINESS_CONFIG.email}</p>
                <p>WhatsApp: {BUSINESS_CONFIG.phone}</p>
              </div>
            </section>

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                {t(content, 'legal.lastUpdated', 'Last updated: January 2025')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
