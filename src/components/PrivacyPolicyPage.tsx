import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    id: 'collect',
    title: 'Information We Collect',
    content: `We collect information you provide directly when creating an account, including your name, email address, phone number, company name, and professional details such as years of experience, specialties, DOT/MC numbers, and profile photos.

We also collect information automatically when you use the platform, including device information, IP address, browser type, pages visited, and usage patterns. This helps us improve the platform and provide a better experience.

If you connect through third-party services (such as Google), we may receive basic profile information from those services in accordance with their privacy policies and your privacy settings.`,
  },
  {
    id: 'use',
    title: 'How We Use Your Information',
    content: `We use the information we collect to:

- Create and manage your account
- Display your professional profile in our directory
- Facilitate connections between dispatchers, carriers, and brokers
- Enable messaging between connected users
- Verify carrier authority through FMCSA databases
- Process subscription payments and manage billing
- Send important service notifications and updates
- Improve platform features and user experience
- Detect and prevent fraud, abuse, and security incidents
- Comply with legal obligations and enforce our terms`,
  },
  {
    id: 'sharing',
    title: 'Information Sharing & Disclosure',
    content: `We do not sell your personal information to third parties. We may share your information in the following circumstances:

- Profile Information: Your professional profile (name, company, specialties) is visible to other registered users of the platform as part of the directory and networking features.
- Service Providers: We share information with trusted third-party service providers who assist us in operating the platform, processing payments, and providing customer support.
- Legal Requirements: We may disclose information when required by law, regulation, legal process, or governmental request.
- Safety & Security: We may share information to protect the safety, rights, or property of DispatchLink, our users, or the public.
- Business Transfers: In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.`,
  },
  {
    id: 'security',
    title: 'Data Security',
    content: `We implement industry-standard security measures to protect your personal information, including:

- Encryption of data in transit (TLS/SSL) and at rest
- Regular security audits and vulnerability assessments
- Access controls limiting employee access to personal data
- Secure cloud infrastructure with Supabase and Vercel
- Row-level security policies on database tables

While we strive to protect your information, no method of electronic storage or transmission is 100% secure. We encourage you to use strong passwords and protect your account credentials.`,
  },
  {
    id: 'rights',
    title: 'Your Rights & Choices',
    content: `Depending on your location, you may have the following rights regarding your personal information:

- Access: Request a copy of the personal information we hold about you.
- Correction: Request correction of inaccurate or incomplete information.
- Deletion: Request deletion of your personal information, subject to certain legal exceptions.
- Portability: Request your data in a portable, machine-readable format.
- Opt-Out: Opt out of marketing communications at any time.
- Withdraw Consent: Where processing is based on consent, you may withdraw it at any time.

To exercise these rights, please contact us at the information provided below. We will respond to your request within 30 days.`,
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking Technologies',
    content: `We use cookies and similar technologies to:

- Keep you signed in to your account
- Remember your preferences and settings
- Analyze platform usage and performance
- Provide personalized content and features

You can manage cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.

We use localStorage to persist your session and profile data for a seamless experience across page refreshes. This data remains on your device and is not transmitted to third parties.`,
  },
  {
    id: 'children',
    title: "Children's Privacy",
    content: `DispatchLink is designed for professional use in the trucking and transportation industry. Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected information from a child under 18, we will take steps to delete that information promptly.`,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on the platform with a new effective date. Your continued use of the platform after changes are posted constitutes your acceptance of the revised policy.`,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:

DispatchLink
Fayetteville, NC
Email: privacy@dispatchlinkpro.vip

For GDPR-related inquiries (EU users), you may also contact your local data protection authority.`,
  },
];

const PrivacyPolicyPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>('collect');

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F]/10 rounded-full mb-4">
            <Shield className="w-5 h-5 text-[#1E3A5F]" />
            <span className="text-sm font-semibold text-[#1E3A5F]">Legal</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: February 15, 2026</p>
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
            DispatchLink ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our platform at dispatchlinkpro.vip.
          </p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-[#1E3A5F]">{section.title}</h2>
                {expanded === section.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expanded === section.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;
