import React from 'react';
import {
  Megaphone, TrendingUp, Users, Target, BarChart3, DollarSign,
  CheckCircle, ArrowRight, Eye, Zap, Shield, MapPin, LogIn, UserPlus
} from 'lucide-react';

interface AdvertisingPageProps {
  onNavigate: (view: string) => void;
  onOpenAdvertiserAuth?: (mode: 'login' | 'signup') => void;
}

const AdvertisingPage: React.FC<AdvertisingPageProps> = ({ onNavigate, onOpenAdvertiserAuth }) => {
  const stats = [
    { icon: Users, label: 'Active Users', value: 'Growing Community', desc: 'Dispatchers, carriers & brokers' },
    { icon: Eye, label: 'Feed Views', value: 'High Engagement', desc: 'Daily active feed impressions' },
    { icon: Target, label: 'Targeting', value: '3 User Types', desc: 'Dispatcher, carrier, broker' },
    { icon: MapPin, label: 'Regions', value: 'Nationwide', desc: 'All 50 states covered' },
  ];

  return (
    <section className="page-bg min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-[#2c5282] py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-10 right-20 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center text-white relative">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/10">
            <Megaphone className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-sm font-semibold text-[#F59E0B]">DispatchLink Advertising</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Reach the Trucking Industry's<br />Decision Makers
          </h1>
          <p className="text-lg text-blue-200/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Put your business in front of verified dispatchers, carriers, and brokers.
            Custom solutions for every budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onOpenAdvertiserAuth?.('signup')}
              className="px-8 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-xl text-lg font-bold transition-all hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up as Advertiser
            </button>
            <button
              onClick={() => onOpenAdvertiserAuth?.('login')}
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20 inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Advertiser Portal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 -mt-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <stat.icon className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1E3A5F]">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Advertise */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-3">Why Advertise on DispatchLink?</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Connect directly with trucking professionals who are actively looking for services, partners, and solutions.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h3 className="font-bold text-[#1E3A5F] mb-2">Precision Targeting</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Target by user type (dispatchers, carriers, brokers), operating region, and industry segment. Your ads reach the exact audience you need.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <h3 className="font-bold text-[#1E3A5F] mb-2">Flexible Pricing</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We work with you to create a tailored advertising package that fits your budget. No long-term contracts. Scale up or pause anytime.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-[#10B981]" />
            </div>
            <h3 className="font-bold text-[#1E3A5F] mb-2">Measurable Results</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track impressions, clicks, and engagement in real time. Know exactly how your ads perform and optimize for better results.
            </p>
          </div>
        </div>

        {/* Custom Pricing Card */}
        <div id="pricing" className="mb-16 scroll-mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-3">Custom Pricing</h2>
            <p className="text-gray-600">Tailored packages designed for your business goals.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border-2 border-[#F59E0B] p-8 shadow-lg ring-2 ring-[#F59E0B]/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center mb-5 shadow-md mx-auto">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] text-center mb-2">Advertise on DispatchLink</h3>
              <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
                Contact our team to discuss a tailored advertising package. We offer feed posts, directory spotlights, and banner placements with flexible pricing.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Promoted feed posts to your target audience',
                  'Directory spotlight placements',
                  'Banner ads across key pages',
                  'User type & region targeting',
                  'Real-time impression & click analytics',
                  'Dedicated account support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onOpenAdvertiserAuth?.('signup')}
                className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-xl font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Get Started
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                No commitment required. Our team will reach out to discuss pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Formats */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-3">Ad Formats That Work</h2>
            <p className="text-gray-600">Designed to blend naturally with the platform while standing out to your audience.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#3B82F6]" />
                Promoted Feed Posts
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your message appears directly in user feeds, styled like organic content with a subtle "Sponsored" label.
                Users can engage with your post.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Your Business Name</p>
                    <p className="text-[10px] text-amber-600 font-medium">Sponsored</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Your ad copy appears here with a link to your site...</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#10B981]" />
                Directory Spotlight
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your company appears at the top of the dispatcher or carrier directory with a highlighted card and "Featured" badge.
                Maximum visibility when users are actively searching.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-[#F59E0B]/30">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded text-[10px] font-bold">FEATURED</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Your Company LLC</p>
                    <p className="text-[10px] text-gray-500">Highlighted at the top of results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Targeting Options */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-3">Targeting Options</h2>
            <p className="text-gray-600">Reach exactly who you need to reach.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'By User Type', desc: 'Dispatchers, carriers, or brokers', icon: Users },
              { label: 'By Region', desc: 'Northeast, Southeast, Midwest, etc.', icon: MapPin },
              { label: 'By Activity', desc: 'Feed readers, active posters', icon: TrendingUp },
              { label: 'By Company Size', desc: 'Owner-operators to fleets', icon: BarChart3 },
            ].map((option, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <option.icon className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#1E3A5F]">{option.label}</p>
                <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div id="contact" className="scroll-mt-8">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2c5282] rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Ready to Reach Trucking Professionals?</h2>
            <p className="text-blue-200 mb-6 max-w-lg mx-auto text-sm">Create your advertiser account and start building campaigns. Our team will work with you to find the right pricing.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenAdvertiserAuth?.('signup')}
                className="px-8 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-xl font-bold transition-all hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Sign Up as Advertiser
              </button>
              <button
                onClick={() => onOpenAdvertiserAuth?.('login')}
                className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In to Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisingPage;
