import React from 'react';
import { Truck, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Feed', action: () => onNavigate('feed') },
      { label: 'Find Dispatchers', action: () => onNavigate('dispatchers') },
      { label: 'Find Carriers', action: () => onNavigate('carriers') },
      { label: 'Brokers', action: () => onNavigate('brokers') },
      { label: 'Connections', action: () => onNavigate('connections') },
    ],
    resources: [
      { label: 'Compliance Guide', action: () => onNavigate('compliance') },
      { label: 'Carrier Packets', action: () => onNavigate('packets') },
      { label: 'FMCSA Resources', href: 'https://www.fmcsa.dot.gov' },
      { label: 'Help Center', action: () => onNavigate('help') },
      { label: 'API Documentation', action: () => onNavigate('api') },
    ],
    company: [
      { label: 'About Us', action: () => onNavigate('about') },
      { label: 'Careers', action: () => onNavigate('careers') },
      { label: 'Press', action: () => onNavigate('press') },
      { label: 'Contact', action: () => onNavigate('contact') },
      { label: 'Partners', action: () => onNavigate('partners') },
    ],
    legal: [
      { label: 'Terms of Service', action: () => onNavigate('terms') },
      { label: 'Privacy Policy', action: () => onNavigate('privacy') },
      { label: 'Cookie Policy', action: () => onNavigate('cookies') },
      { label: 'GDPR', action: () => onNavigate('gdpr') },
      { label: 'CCPA', action: () => onNavigate('ccpa') },
    ],
  };

  return (
    <footer className="bg-[#1a365d] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#ff6b35] p-2 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">DispatchLink</span>
                <span className="text-xs block text-gray-400">Trucking Network</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              The premier platform connecting dispatchers and carriers. 
              Built for compliance, designed for success.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:support@dispatchlinkpro.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                support@dispatchlinkpro.com
              </a>
              <a href="tel:1-800-555-0123" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <Phone className="w-4 h-4" />
                1-800-555-0123
              </a>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                Dallas, TX 75201
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-[#ff6b35] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-[#ff6b35] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-[#ff6b35] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-[#ff6b35] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  {'href' in link ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} DispatchLink. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>FMCSA Compliant Platform</span>
              <span>•</span>
              <span>GDPR Ready</span>
              <span>•</span>
              <span>CCPA Compliant</span>
              <span>•</span>
              <span>SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-[#0f1f33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            DispatchLink is a professional networking platform for the trucking industry. We do not act as a broker, carrier, or shipper. 
            Users are responsible for their own regulatory compliance. Dispatchers arranging transportation for 
            compensation may need broker authority from the FMCSA. This platform does not provide legal, tax, 
            or regulatory advice. Consult qualified professionals for specific guidance.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
