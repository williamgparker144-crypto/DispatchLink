import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Robert Thompson',
    role: 'Owner-Operator',
    company: 'Thompson Trucking LLC',
    image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418505750_37b6a043.png',
    rating: 5,
    text: 'DispatchLink helped me find a reliable dispatcher within days. The MC# permission system gives me peace of mind knowing I control who uses my authority.',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Dispatch Manager',
    company: 'Williams Logistics Group',
    image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418479994_627b2454.png',
    rating: 5,
    text: 'The networking features are a game-changer. I went from cold-calling to having qualified carriers reach out to me through connections. My business has grown 40% since joining.',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Fleet Manager',
    company: 'Johnson Carriers Inc',
    image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418478138_3a06fafe.png',
    rating: 5,
    text: 'The carrier onboarding packets saved us hours of paperwork. Everything is organized, compliant, and professional. Highly recommend for any fleet operation.',
  },
  {
    id: 4,
    name: 'Maria Garcia',
    role: 'Independent Dispatcher',
    company: 'Garcia Dispatch Services',
    image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418479362_901c4ead.png',
    rating: 5,
    text: 'As a new dispatcher, the compliance resources and templates were invaluable. The platform made it easy to build my business the right way from day one.',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#1a365d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-[#ff6b35]/20 text-[#ff6b35] rounded-full text-sm font-semibold mb-4">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Trusted by Trucking Professionals
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See what dispatchers and carriers are saying about DispatchLink
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{testimonial.name}</h3>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-sm text-[#ff6b35]">{testimonial.company}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#ff6b35]/20" />
                <p className="text-gray-300 pl-6">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '5,000+', label: 'Active Users' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '50K+', label: 'Connections Made' },
            { value: '24/7', label: 'Support Available' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
