import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Veloz',
  description: 'Our privacy policy explains how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">
          <strong>Last updated:</strong> January 8, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Veloz ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and contact information (email, phone number)</li>
            <li>Event details and requirements</li>
            <li>Communication preferences</li>
            <li>Payment information (processed securely through third-party providers)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Automatically Collected Information</h3>
          <p>When you visit our website, we automatically collect certain information, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website information</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our services</li>
            <li>Process your requests and inquiries</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our website and services</li>
            <li>Analyze usage patterns and trends</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and providing services</li>
            <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
            <li><strong>Consent:</strong> We may share information with your explicit consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure hosting and infrastructure</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies to enhance your browsing experience and analyze website usage. You can control cookie settings through your browser preferences.</p>
          
          <h3 className="text-xl font-medium mb-3">6.1 Types of Cookies We Use</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
            <li><strong>Erasure:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Objection:</strong> Object to processing of your personal information</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Contact messages: 1 year</li>
            <li>Analytics data: 2 years</li>
            <li>User sessions: 3 months</li>
            <li>Backup data: 7 years</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
          <p>Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
          <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p><strong>Email:</strong> privacy@veloz.com.uy</p>
            <p><strong>Address:</strong> Montevideo, Uruguay</p>
            <p><strong>Phone:</strong> +598 [Phone Number]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. GDPR Compliance (EU Users)</h2>
          <p>If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR):</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Right to be informed about data processing</li>
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Rights related to automated decision making</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided above.</p>
        </section>
      </div>
    </div>
  );
} 