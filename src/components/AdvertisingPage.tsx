import React, { useState } from 'react';
import {
  Megaphone, TrendingUp, Users, Target, BarChart3, DollarSign,
  CheckCircle, ArrowRight, Mail, Eye, Zap, Shield, MapPin
} from 'lucide-react';

interface AdvertisingPageProps {
  onNavigate: (view: string) => void;
}

const AdvertisingPage: React.FC<AdvertisingPageProps> = ({ onNavigate }) => {
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactEmail.trim() && contactName.trim()) {
      setSubmitted(true);
    }
  };

  const tiers = [
    {
      id: 'starter',
      name: 'Feed Post',
      price: '$1',
      period: '/day',
      description: 'Promoted post in the community feed. Appears alongside organic content.',
      features: [
        'Appears in user feeds',
        'Branded "Sponsored" label',
        'Like & comment enabled',
        'Link to your website',
        'Basic impression tracking',
      ],
      color: 'from-[#3B82F6] to-[#2563EB]',
      borderColor: 'border-[#3B82F6]',
      bgColor: 'bg-blue-50',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Directory Spotlight',
      price: '$3',
      period: '/day',
      description: 'Featured listing at the top of carrier or dispatcher directories.',
      features: [
        'Top position in directory',
        'Highlighted card with badge',
        'Priority in search results',
        'Company logo display',
        'Click-through analytics',
        'Target by region',
      ],
      color: 'from-[#F59E0B] to-[#D97706]',
      borderColor: 'border-[#F59E0B]',
      bgColor: 'bg-amber-50',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Premium Banner',
      price: '$5',
      period: '/day',
      description: 'High-visibility banner placement across key pages of the platform.',
      features: [
        'Banner on Feed & Directory pages',
        'Custom image creative',
        'Click-through to any URL',
        'Target by user type & region',
        'Detailed performance dashboard',
        'Priority support',
      ],
      color: 'from-[#1E3A5F] to-[#2c5282]',
      borderColor: 'border-[#1E3A5F]',
      bgColor: 'bg-slate-50',
      popular: false,
    },
  ];

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
            Targeted advertising starting at just <strong className="text-white">$1.00/day</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 btn-glossy-primary rounded-xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              View Pricing
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Contact Sales
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
            <h3 className="font-bold text-[#1E3A5F] mb-2">Budget-Friendly</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Start with as little as $1/day. No long-term contracts, no minimum spend. Scale up or pause anytime with full control over your budget.
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

        {/* Pricing Tiers */}
        <div id="pricing" className="mb-16 scroll-mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-600">No contracts. No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map(tier => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl border-2 ${
                  selectedTier === tier.id ? tier.borderColor : 'border-gray-200'
                } p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                  tier.popular ? 'ring-2 ring-[#F59E0B]/30' : ''
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 shadow-md`}>
                  <Megaphone className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{tier.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-[#1E3A5F]">{tier.price}</span>
                  <span className="text-gray-500 font-medium">{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier.id);
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-sm ${
                    tier.popular
                      ? 'btn-glossy-primary'
                      : 'btn-glossy-outline'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            All prices in USD. Billed daily while active. You set your own daily budget and can pause or cancel at any time.
          </p>
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
                Users can like, comment, and engage with your post.
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

        {/* Contact / Get Started Form */}
        <div id="contact" className="scroll-mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2c5282] p-6 text-white">
              <h2 className="text-xl font-bold mb-1">Get Started with Advertising</h2>
              <p className="text-sm text-blue-200">Fill out the form below and our team will reach out within 24 hours.</p>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Request Submitted</h3>
                  <p className="text-gray-600 mb-2">
                    We've received your advertising inquiry{selectedTier ? ` for the ${tiers.find(t => t.id === selectedTier)?.name} plan` : ''}.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">Our advertising team will contact you at <strong>{contactEmail}</strong> within 24 hours.</p>
                  <button
                    onClick={() => onNavigate('feed')}
                    className="px-6 py-3 btn-glossy-navy rounded-xl transition-all"
                  >
                    Back to Feed
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {selectedTier && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                      <span className="font-semibold text-[#1E3A5F]">Selected plan: </span>
                      <span className="text-gray-700">{tiers.find(t => t.id === selectedTier)?.name} — {tiers.find(t => t.id === selectedTier)?.price}{tiers.find(t => t.id === selectedTier)?.period}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={contactCompany}
                        onChange={(e) => setContactCompany(e.target.value)}
                        placeholder="Your Company LLC"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  {!selectedTier && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Interested In</label>
                      <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-sm bg-white"
                      >
                        <option value="">Select a plan...</option>
                        {tiers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} — {t.price}{t.period}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 btn-glossy-primary rounded-xl transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <Megaphone className="w-5 h-5" />
                    Submit Advertising Request
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    By submitting, you agree to be contacted about DispatchLink advertising. No commitment required.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisingPage;
