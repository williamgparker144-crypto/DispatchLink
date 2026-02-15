import React, { useState } from 'react';
import {
  Rocket,
  Mail,
  CheckCircle,
  Globe,
  TrendingUp,
  Network,
  BarChart3,
  Shield,
  Zap,
  Users,
  Truck,
  Building,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';

const CarrierScoutPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      subscribeToMailchimp({ email, source: 'waitlist' });
    }
  };

  const capabilities = [
    {
      icon: Globe,
      title: 'Unified Load Board',
      desc: 'Aggregate loads from every major board into one intelligent feed. Stop switching between platforms and never miss high-value freight.',
    },
    {
      icon: TrendingUp,
      title: 'AI Rate Intelligence',
      desc: 'Real-time market rates, lane analytics, and negotiation tools powered by machine learning across millions of data points.',
    },
    {
      icon: Network,
      title: 'Network Hub',
      desc: 'Connect dispatchers, carriers, and brokers in a verified professional network with trust scores and performance history.',
    },
    {
      icon: BarChart3,
      title: 'Workflow Automation',
      desc: 'End-to-end load lifecycle from booking to settlement. Automate rate confirmations, BOLs, invoicing, and compliance checks.',
    },
    {
      icon: Shield,
      title: 'Compliance Management',
      desc: 'Automated FMCSA monitoring, insurance tracking, authority verification, and carrier packet management in one dashboard.',
    },
    {
      icon: Zap,
      title: 'Capacity Matching',
      desc: 'Smart algorithms pair available trucks with the highest-value freight based on lane preferences, equipment, and deadhead.',
    },
  ];

  const perspectives = [
    {
      icon: Users,
      role: 'Dispatchers',
      color: 'from-[#3B82F6] to-[#60A5FA]',
      points: [
        'Access every load board from one dashboard',
        'AI-powered rate recommendations per lane',
        'Manage all carrier MC# permissions centrally',
        'Automated rate confirmations and BOLs',
      ],
    },
    {
      icon: Truck,
      role: 'Carriers',
      color: 'from-[#1E3A5F] to-[#1E3A5F]/80',
      points: [
        'Get matched to freight that fits your equipment',
        'Real-time market rate visibility per lane',
        'Verified profile with FMCSA authority data',
        'Digital onboarding packets and compliance tracking',
      ],
    },
    {
      icon: Building,
      role: 'Brokers',
      color: 'from-emerald-600 to-emerald-700',
      points: [
        'Instantly find verified, available capacity',
        'Trust scores and carrier performance history',
        'Streamlined carrier onboarding with auto-verify',
        'Rate intelligence to price loads competitively',
      ],
    },
  ];

  const faqs = [
    {
      q: 'When does CarrierScout launch?',
      a: 'CarrierScout is currently in development. Waitlist members will get priority access during our invite-only beta. Join the waitlist to be among the first to access the platform.',
    },
    {
      q: 'Will my DispatchLink profile carry over?',
      a: 'Yes. Your DispatchLink profile, verified connections, MC# permissions, and all credentials transfer seamlessly to CarrierScout. No need to re-verify or rebuild your network.',
    },
    {
      q: 'What will CarrierScout cost?',
      a: 'CarrierScout will offer a free tier with core features and premium tiers for advanced capabilities like AI rate intelligence and multi-board aggregation. Early waitlist members will receive special launch pricing.',
    },
    {
      q: 'How is CarrierScout different from existing load boards?',
      a: 'CarrierScout is not just a load board. It combines load aggregation, AI-powered pricing, a verified professional network, compliance management, and workflow automation into one unified platform built specifically for the modern freight ecosystem.',
    },
    {
      q: 'Can I invite carriers or dispatchers I work with?',
      a: 'Absolutely. You can invite any carrier or dispatcher directly from DispatchLink. When they sign up, your existing connection and permissions are preserved automatically.',
    },
  ];

  const stats = [
    { label: 'DispatchLink Members', value: 'Growing Network' },
    { label: 'Verified Carriers', value: 'FMCSA Verified' },
    { label: 'Core Platform', value: '100% Free' },
    { label: 'Community', value: 'Active Community' },
  ];

  return (
    <div className="page-bg">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMyAxLjM0NCAzIDNzLTEuMzQ0IDMtMyAzLTMtMS4zNDQtMy0zIDEuMzQ0LTMgMy0zeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20 animate-glow">
              <Rocket className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              CarrierScout
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 font-medium mb-4">
              The Complete Freight Workflow Platform
            </p>
            <p className="text-blue-100/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              One platform for load boards, rate intelligence, carrier verification,
              compliance management, and professional networking. Built for dispatchers,
              carriers, and brokers who demand more.
            </p>

            {submitted ? (
              <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-400/30 px-6 py-4 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="font-semibold text-lg">You're on the list! We'll be in touch.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Rocket className="w-5 h-5" />
                  Join Waitlist
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 page-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-[#1E3A5F] mb-4">
            The freight industry is fragmented. It doesn't have to be.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Dispatchers juggle multiple load boards. Carriers lack real-time market data.
            Brokers struggle to find verified capacity. Everyone manages compliance manually.
            CarrierScout brings it all together in one platform built for how freight actually moves.
          </p>
        </div>
      </section>

      {/* 6 Capabilities */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#1E3A5F] mb-3">
              Everything you need. One platform.
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Six integrated capabilities that replace a dozen disconnected tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3B82F6]/30 transition-all group"
              >
                <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3B82F6]/10 transition-colors">
                  <cap.icon className="w-6 h-6 text-[#1E3A5F] group-hover:text-[#3B82F6] transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{cap.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — 3 Perspectives */}
      <section className="py-20 page-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#1E3A5F] mb-3">
              Built for every role in freight
            </h2>
            <p className="text-gray-600 text-lg">
              CarrierScout adapts to how you work — whether you dispatch, haul, or broker.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {perspectives.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${p.color} p-6 text-white text-center`}>
                  <p.icon className="w-10 h-10 mx-auto mb-3" />
                  <h3 className="text-xl font-bold">{p.role}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {p.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-700">
                        <ArrowRight className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Signup */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-emerald-700 rounded-2xl p-10 text-white glass-dark">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-[#3B82F6]" />
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Get early access</h2>
            <p className="text-blue-100/80 mb-8 max-w-md mx-auto">
              Join the waitlist to be among the first to experience CarrierScout.
              Your DispatchLink profile and connections carry over seamlessly.
            </p>

            {submitted ? (
              <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-400/30 px-6 py-4 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="font-semibold">You're on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 page-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-[#1E3A5F] text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-[#1E3A5F] pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarrierScoutPage;
