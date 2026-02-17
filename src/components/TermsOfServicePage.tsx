import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: `By accessing or using DispatchLink ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.

These Terms constitute a legally binding agreement between you and DispatchLink. We may modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Platform constitutes acceptance of modified Terms.`,
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    content: `To use the Platform, you must:

- Be at least 18 years of age
- Have the legal capacity to enter into a binding agreement
- Not be prohibited from using the Platform under applicable laws

If you are using the Platform on behalf of a business entity, you represent that you have the authority to bind that entity to these Terms.

Dispatchers, carriers, and brokers using the Platform are responsible for maintaining all required licenses, permits, and authority as mandated by the Federal Motor Carrier Safety Administration (FMCSA) and other applicable regulatory bodies.`,
  },
  {
    id: 'accounts',
    title: 'Account Registration & Security',
    content: `When creating an account, you agree to:

- Provide accurate, complete, and current information
- Maintain and promptly update your account information
- Keep your login credentials secure and confidential
- Notify us immediately of any unauthorized access to your account
- Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that contain inaccurate information, violate these Terms, or remain inactive for extended periods.`,
  },
  {
    id: 'content',
    title: 'User Content & Conduct',
    content: `You retain ownership of content you post on the Platform. By posting content, you grant DispatchLink a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Platform.

You agree not to:

- Post false, misleading, or fraudulent information
- Impersonate any person or entity
- Harass, threaten, or abuse other users
- Post spam, advertisements, or unsolicited commercial content
- Upload malicious software or harmful code
- Attempt to gain unauthorized access to other accounts or platform systems
- Use the Platform for any illegal purpose
- Violate any applicable FMCSA regulations or transportation laws
- Misrepresent your authority status, insurance coverage, or safety record

We reserve the right to remove any content and suspend or terminate accounts that violate these guidelines.`,
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    content: `The Platform, including its design, features, content, and technology, is owned by DispatchLink and protected by intellectual property laws. You may not:

- Copy, modify, or distribute Platform content without authorization
- Reverse engineer or decompile any Platform technology
- Use our trademarks or branding without written permission
- Scrape, data mine, or use automated tools to access Platform data

DispatchLink, the DispatchLink logo, and CarrierScout are trademarks of DispatchLink. All other trademarks appearing on the Platform are the property of their respective owners.`,
  },
  {
    id: 'third-party',
    title: 'Third-Party Links & Services',
    content: `The Platform may contain links to third-party websites and services, including but not limited to the FMCSA SAFER database, payment processors, and social media platforms. We are not responsible for the content, privacy policies, or practices of third-party services.

Your use of third-party services is governed by their respective terms and policies. We encourage you to review those terms before using any third-party services accessed through our Platform.`,
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers & Limitation of Liability',
    content: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

DispatchLink is a professional networking platform. We do not:

- Act as a broker, carrier, or shipper
- Guarantee the accuracy of user-provided information
- Verify the ongoing validity of DOT/MC numbers after initial verification
- Provide legal, tax, or regulatory advice
- Guarantee any business outcomes from using the Platform

TO THE MAXIMUM EXTENT PERMITTED BY LAW, DISPATCHLINK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM.`,
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    content: `You agree to indemnify, defend, and hold harmless DispatchLink, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from:

- Your use of the Platform
- Your violation of these Terms
- Your violation of any third-party rights
- Content you post on the Platform
- Your violation of any applicable laws or regulations, including FMCSA regulations`,
  },
  {
    id: 'termination',
    title: 'Termination',
    content: `We may suspend or terminate your account at any time, with or without cause, and with or without notice. Upon termination:

- Your right to access the Platform ceases immediately
- You remain liable for any obligations incurred before termination
- Provisions that by their nature should survive termination will continue to apply (including Disclaimers, Limitation of Liability, and Indemnification)

You may delete your account at any time by contacting us. Upon account deletion, we will remove your profile information from the Platform, though certain data may be retained as required by law or for legitimate business purposes.`,
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of North Carolina, without regard to its conflict of law provisions.

Any disputes arising from these Terms or your use of the Platform shall be resolved in the state or federal courts located in Cumberland County, North Carolina. You consent to the exclusive jurisdiction of these courts.`,
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. Material changes will be communicated through the Platform or via email. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.

We encourage you to review these Terms periodically to stay informed of any updates.`,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: `If you have questions about these Terms of Service, please contact us:

DispatchLink
Fayetteville, NC
Email: legal@dispatchlinkpro.vip`,
  },
];

const TermsOfServicePage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>('acceptance');

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F]/10 rounded-full mb-4">
            <FileText className="w-5 h-5 text-[#1E3A5F]" />
            <span className="text-sm font-semibold text-[#1E3A5F]">Legal</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: February 15, 2026</p>
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using DispatchLink.
            By using our platform at dispatchlinkpro.vip, you agree to be bound by these terms.
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

export default TermsOfServicePage;
