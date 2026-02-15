import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Is DispatchLink free?',
    answer: 'Yes! DispatchLink is 100% free to use for dispatchers, carriers, and brokers. Create a profile, build your professional network, connect with industry professionals, and message your connections — all at no cost.',
  },
  {
    question: 'What is CarrierScout?',
    answer: 'CarrierScout is our upcoming premium marketplace platform for load matching, loadboard integrations, and advanced analytics. Think of DispatchLink as your professional network and CarrierScout as where you do business. CarrierScout is coming soon — join the waitlist to be notified!',
  },
  {
    question: 'How do connections work?',
    answer: 'Send a connection request to any dispatcher, carrier, or broker on the platform. Once they accept, you can message each other directly, see their full profile details, and stay updated on their posts. It\'s like building your professional trucking rolodex.',
  },
  {
    question: 'How does MC# permission work?',
    answer: 'Carriers maintain full control over their MC# authority. When a dispatcher requests access, carriers can grant permission through our digital consent system. This allows dispatchers to book loads on loadboards using the carrier\'s MC#. Carriers can revoke access at any time from their dashboard.',
  },
  {
    question: 'Is DispatchLink FMCSA compliant?',
    answer: 'Yes, our platform is designed with FMCSA compliance in mind. We verify all carrier DOT and MC numbers, provide compliance resources and templates, and include broker authority disclaimers. However, users are responsible for maintaining their own regulatory compliance.',
  },
  {
    question: 'Who can join DispatchLink?',
    answer: 'DispatchLink is open to dispatchers, carriers, and brokers in the trucking industry. All users must verify their identity and credentials (DOT#, MC#) to maintain the quality and trust of our professional network.',
  },
  {
    question: 'What can I do on the social feed?',
    answer: 'Share industry updates, post when you\'re looking for dispatch services or available trucks, celebrate milestones, and stay informed about what\'s happening in your network. The feed helps you stay visible and connected in the trucking community.',
  },
  {
    question: 'Will my DispatchLink profile carry over to CarrierScout?',
    answer: 'Absolutely! Your verified profile, connections, and reputation on DispatchLink will transfer seamlessly to CarrierScout when it launches. Building your network now means you\'ll be ready to hit the ground running on the premium platform.',
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 page-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#1E3A5F]/10 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-5 h-5 text-[#1E3A5F]" />
            <span className="text-sm font-medium text-[#1E3A5F]">FAQ</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about DispatchLink
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#1E3A5F] pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/80 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
