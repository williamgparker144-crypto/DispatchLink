import React from 'react';
import { Shield, Lock, DollarSign, FileCheck } from 'lucide-react';

const valueProps = [
  {
    id: 1,
    icon: Shield,
    title: 'Verified Network',
    description: 'Every carrier and dispatcher is verified through FMCSA with active DOT and MC authority. Build your network with confidence.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    icon: Lock,
    title: 'Permission Control',
    description: 'Carriers maintain full control of their MC# authority with digital consent forms. Grant, revoke, and audit access anytime.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 3,
    icon: DollarSign,
    title: 'Always Free',
    description: 'Build your professional network at zero cost. No subscriptions, no hidden fees. Connect, message, and grow without limits.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 4,
    icon: FileCheck,
    title: 'Compliance Ready',
    description: 'Built-in FMCSA compliance tools, onboarding packet templates, and carrier authority verification — all in one platform.',
    color: 'from-amber-500 to-amber-600',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded-full text-sm font-semibold mb-4">
            WHY DISPATCHLINK
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Built for the Freight Industry
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A professional network designed around how dispatchers, carriers, and brokers actually work
          </p>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {valueProps.map((prop) => (
            <div
              key={prop.id}
              className="glass-dark rounded-2xl p-6 hover:bg-white/15 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${prop.color} text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <prop.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">{prop.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{prop.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
