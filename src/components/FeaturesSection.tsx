import React from 'react';
import {
  Rss, Shield, FileText, Users,
  MessageSquare, Lock, Globe, Bell, Database, Award,
  UserPlus, Briefcase
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Rss className="w-6 h-6" />,
      title: 'Social Feed',
      description: 'Share updates, post available trucks, and stay connected with the trucking community in real-time.',
      color: 'bg-blue-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'DOT MC# Verification',
      description: 'All carriers verified with active DOT and MC numbers. Real-time authority status checks.',
      color: 'bg-green-500',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Carrier Onboarding Packets',
      description: 'Professional template packets for W-9, insurance certificates, and authority documentation.',
      color: 'bg-purple-500',
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Connections & Networking',
      description: 'Build your professional network by connecting with dispatchers, carriers, and brokers.',
      color: 'bg-orange-500',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Direct Messaging',
      description: 'Message your connections directly. Discuss opportunities, share details, and close deals.',
      color: 'bg-indigo-500',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Permission Management',
      description: 'Secure MC# sharing system with digital consent forms and audit trail logging.',
      color: 'bg-pink-500',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Broker Directory',
      description: 'Find and connect with verified freight brokers. Browse by specialty, region, and ratings.',
      color: 'bg-yellow-500',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'FMCSA Compliance',
      description: 'Built-in compliance tools, broker authority disclaimers, and regulatory guidance.',
      color: 'bg-red-500',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Platform Access',
      description: 'Available on web, iOS, and Android. Manage your business from anywhere.',
      color: 'bg-emerald-500',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Real-Time Alerts',
      description: 'Instant notifications for connection requests, messages, and authority status changes.',
      color: 'bg-cyan-500',
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Secure Data Storage',
      description: 'GDPR and CCPA compliant data handling with encrypted storage and privacy controls.',
      color: 'bg-slate-500',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verified Badges',
      description: 'Build trust with verification badges for experience, insurance, and performance ratings.',
      color: 'bg-amber-500',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-full text-sm font-semibold mb-4">
            PLATFORM FEATURES
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A5F] mb-4">
            Everything You Need to Connect & Grow
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Free professional tools designed for dispatchers, carriers, and brokers to network and build lasting business relationships.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-[#3B82F6]/10 transition-all border border-transparent hover:border-gray-100 group glass-light"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-[#1E3A5F] mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418545509_88fd7451.jpg"
              alt="Platform Network"
              className="w-full max-w-md rounded-xl shadow-lg"
            />
            <div className="text-left max-w-md">
              <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                Your Professional Trucking Network
              </h3>
              <p className="text-gray-600 mb-4">
                Build your network, share opportunities, and connect with verified professionals.
                Your DispatchLink connections and verified badges carry over when premium features launch on CarrierScout.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-full text-sm font-medium">Dispatchers</span>
                <span className="px-3 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-full text-sm font-medium">Carriers</span>
                <span className="px-3 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-full text-sm font-medium">Brokers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
