import React, { useState } from 'react';
import { 
  Shield, FileText, Scale, AlertTriangle, CheckCircle, 
  ChevronDown, ChevronUp, ExternalLink, Lock, Eye 
} from 'lucide-react';

const ComplianceSection: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('fmcsa');

  const complianceAreas = [
    {
      id: 'fmcsa',
      title: 'FMCSA Regulations',
      icon: <Shield className="w-5 h-5" />,
      content: [
        {
          title: 'Broker Authority Requirements',
          description: 'Dispatchers operating as brokers must obtain proper broker authority (MC number) from the FMCSA. Our platform provides guidance on obtaining and maintaining broker authority.',
        },
        {
          title: 'Carrier Authority Verification',
          description: 'All carriers on our platform must have active operating authority. We verify DOT and MC numbers against the FMCSA SAFER database in real-time.',
        },
        {
          title: 'Insurance Requirements',
          description: 'Carriers must maintain minimum insurance coverage as required by FMCSA. Our platform tracks insurance expiration dates and sends alerts.',
        },
        {
          title: 'Hours of Service Compliance',
          description: 'Dispatchers must be aware of HOS regulations when booking loads. Our platform provides HOS reference materials and compliance reminders.',
        },
      ],
    },
    {
      id: 'contracts',
      title: 'Contract & Agreement Templates',
      icon: <FileText className="w-5 h-5" />,
      content: [
        {
          title: 'Dispatcher-Carrier Agreement',
          description: 'Standard agreement template covering dispatch services, fees, payment terms, and liability provisions. Customizable for your business needs.',
        },
        {
          title: 'MC# Permission Grant',
          description: 'Digital consent form for carriers to grant dispatchers permission to use their MC# for loadboard access. Includes audit trail and revocation process.',
        },
        {
          title: 'Rate Confirmation Template',
          description: 'Professional rate confirmation documents that comply with industry standards and include all required information.',
        },
        {
          title: 'Non-Disclosure Agreement',
          description: 'Protect sensitive business information with our NDA template designed for the trucking industry.',
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Data Privacy & Security',
      icon: <Lock className="w-5 h-5" />,
      content: [
        {
          title: 'GDPR Compliance',
          description: 'Our platform complies with the General Data Protection Regulation for users in the European Union, including data portability and right to erasure.',
        },
        {
          title: 'CCPA Compliance',
          description: 'California Consumer Privacy Act compliance for California residents, including disclosure of data collection practices and opt-out rights.',
        },
        {
          title: 'Data Encryption',
          description: 'All sensitive data is encrypted at rest and in transit using industry-standard AES-256 encryption.',
        },
        {
          title: 'Access Controls',
          description: 'Role-based access controls ensure users only see data they are authorized to access. Complete audit logging of all data access.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability & Disclaimers',
      icon: <Scale className="w-5 h-5" />,
      content: [
        {
          title: 'Platform Disclaimer',
          description: 'DispatchLink Pro is a directory and matching service. We do not act as a broker, carrier, or shipper. Users are responsible for their own regulatory compliance.',
        },
        {
          title: 'Carrier Responsibility',
          description: 'Carriers maintain full responsibility for their operating authority, insurance, and compliance with all applicable regulations.',
        },
        {
          title: 'Dispatcher Responsibility',
          description: 'Dispatchers are responsible for obtaining proper authority if acting as brokers and for compliance with all applicable regulations.',
        },
        {
          title: 'Limitation of Liability',
          description: 'Our liability is limited to the fees paid for our services. We are not liable for any damages arising from carrier-dispatcher relationships.',
        },
      ],
    },
    {
      id: 'disputes',
      title: 'Dispute Resolution',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        {
          title: 'Mediation Process',
          description: 'Disputes between users should first attempt resolution through our mediation process. We provide neutral facilitation for common issues.',
        },
        {
          title: 'Arbitration Clause',
          description: 'Unresolved disputes are subject to binding arbitration as outlined in our Terms of Service. Arbitration is conducted by a neutral third party.',
        },
        {
          title: 'Reporting Violations',
          description: 'Users can report violations of platform policies or suspected fraud through our reporting system. We investigate all reports promptly.',
        },
        {
          title: 'Account Suspension',
          description: 'Accounts may be suspended for violations of our Terms of Service, fraudulent activity, or failure to maintain required compliance.',
        },
      ],
    },
  ];

  return (
    <section id="compliance" className="py-20 page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
            LEGAL & COMPLIANCE
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-4">
            Built for Compliance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform is designed with regulatory compliance in mind. Access resources, templates, 
            and guidance to keep your operations compliant.
          </p>
        </div>

        {/* Compliance Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E3A5F]">FMCSA Verified</h3>
                <p className="text-sm text-gray-500">Real-time authority checks</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              All carrier profiles are verified against the FMCSA SAFER database to ensure active operating authority.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E3A5F]">Data Protected</h3>
                <p className="text-sm text-gray-500">GDPR & CCPA compliant</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Your data is protected with enterprise-grade security and complies with major privacy regulations.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E3A5F]">Audit Trail</h3>
                <p className="text-sm text-gray-500">Complete transparency</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Every MC# permission grant, revocation, and access is logged for complete accountability.
            </p>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {complianceAreas.map((area) => (
            <div key={area.id} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setExpandedSection(expandedSection === area.id ? null : area.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#1E3A5F]/10 rounded-lg text-[#1E3A5F]">
                    {area.icon}
                  </div>
                  <span className="font-semibold text-[#1E3A5F]">{area.title}</span>
                </div>
                {expandedSection === area.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === area.id && (
                <div className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 gap-4 pl-12">
                    {area.content.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-[#1E3A5F] mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Important Legal Notice</h3>
              <p className="text-sm text-yellow-700 mb-4">
                DispatchLink Pro is a directory and matching platform. We do not provide legal, tax, or regulatory advice. 
                Users are responsible for ensuring their own compliance with all applicable federal, state, and local regulations. 
                Dispatchers who arrange transportation for compensation may need to obtain broker authority from the FMCSA. 
                Consult with a qualified attorney or compliance professional for specific guidance.
              </p>
              <a 
                href="https://www.fmcsa.dot.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Visit FMCSA Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
