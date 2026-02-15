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
      accentColor: '#3B82F6',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'DOT MC# Verification',
      description: 'All carriers verified with active DOT and MC numbers. Real-time authority status checks.',
      color: 'bg-green-500',
      accentColor: '#22C55E',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Carrier Onboarding Packets',
      description: 'Professional template packets for W-9, insurance certificates, and authority documentation.',
      color: 'bg-purple-500',
      accentColor: '#A855F7',
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Connections & Networking',
      description: 'Build your professional network by connecting with dispatchers, carriers, and brokers.',
      color: 'bg-orange-500',
      accentColor: '#F97316',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Direct Messaging',
      description: 'Message your connections directly. Discuss opportunities, share details, and close deals.',
      color: 'bg-indigo-500',
      accentColor: '#6366F1',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Permission Management',
      description: 'Secure MC# sharing system with digital consent forms and audit trail logging.',
      color: 'bg-pink-500',
      accentColor: '#EC4899',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Broker Directory',
      description: 'Find and connect with verified freight brokers. Browse by specialty, region, and ratings.',
      color: 'bg-yellow-500',
      accentColor: '#EAB308',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'FMCSA Compliance',
      description: 'Built-in compliance tools, broker authority disclaimers, and regulatory guidance.',
      color: 'bg-red-500',
      accentColor: '#EF4444',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Platform Access',
      description: 'Available on web, iOS, and Android. Manage your business from anywhere.',
      color: 'bg-emerald-500',
      accentColor: '#10B981',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Real-Time Alerts',
      description: 'Instant notifications for connection requests, messages, and authority status changes.',
      color: 'bg-cyan-500',
      accentColor: '#06B6D4',
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Secure Data Storage',
      description: 'GDPR and CCPA compliant data handling with encrypted storage and privacy controls.',
      color: 'bg-slate-500',
      accentColor: '#64748B',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verified Badges',
      description: 'Build trust with verification badges for experience, insurance, and performance ratings.',
      color: 'bg-amber-500',
      accentColor: '#F59E0B',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block px-4 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-full text-sm font-semibold mb-4">
            PLATFORM FEATURES
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A5F] mb-4">
            Everything You Need to Connect & Grow
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Free professional tools designed for dispatchers, carriers, and brokers to network and build lasting business relationships.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card-hover p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/60 transition-all border border-transparent hover:border-gray-100 group animate-fade-in-up stagger-${index + 1}`}
              style={{ '--accent-color': feature.accentColor } as React.CSSProperties}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color}/10 mb-4 group-hover:scale-110 transition-transform`}>
                <div className={`${feature.color.replace('bg-', 'text-')}`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-bold text-[#1E3A5F] mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 animate-fade-in-up">
          <div className="relative bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-[#2c5282] rounded-2xl p-8 lg:p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#10B981]/20 to-[#3B82F6]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-br from-[#F59E0B]/10 to-[#8B5CF6]/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#3B82F6] via-[#10B981] to-[#F59E0B] rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-3">
                  <span className="text-4xl font-black text-white">CS</span>
                </div>
                <p className="text-sm font-bold bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">CarrierScout Logistics</p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                  Your Professional Trucking Network
                </h3>
                <p className="text-blue-200/80 mb-5 leading-relaxed max-w-lg">
                  Build your network, share opportunities, and connect with verified professionals.
                  Your DispatchLink connections and verified badges carry over when premium features launch on CarrierScout.
                </p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <span className="px-3 py-1.5 bg-[#3B82F6]/20 text-[#3B82F6] rounded-full text-sm font-semibold border border-[#3B82F6]/30">Dispatchers</span>
                  <span className="px-3 py-1.5 bg-[#10B981]/20 text-[#10B981] rounded-full text-sm font-semibold border border-[#10B981]/30">Carriers</span>
                  <span className="px-3 py-1.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-sm font-semibold border border-[#F59E0B]/30">Brokers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
