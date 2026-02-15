import React from 'react';
import { Smartphone, Apple, Play } from 'lucide-react';

const MobileAppBanner: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <Smartphone className="w-6 h-6 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#3B82F6]">MOBILE APP</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Manage Your Business On The Go
            </h2>
            <p className="text-gray-300 max-w-md mb-6">
              Download the DispatchLink app for iOS and Android.
              Access your dashboard, receive notifications, and connect with carriers/dispatchers anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => alert('App Store version coming soon! Sign up on the web to get notified.')}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors btn-glossy"
              >
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Coming Soon</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </button>
              <button
                onClick={() => alert('Google Play version coming soon! Sign up on the web to get notified.')}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors btn-glossy"
              >
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Coming Soon</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="w-64 h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                <div className="h-8 bg-[#1E3A5F] flex items-center justify-center">
                  <div className="w-20 h-4 bg-black rounded-full" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-[#1E3A5F]">DispatchLink</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-xl p-3">
                      <p className="text-xs text-white/80">Connections</p>
                      <p className="text-2xl font-bold text-white">--</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-gray-100 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Network</p>
                        <p className="text-lg font-bold text-[#1E3A5F]">--</p>
                      </div>
                      <div className="h-16 bg-gray-100 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Messages</p>
                        <p className="text-lg font-bold text-[#1E3A5F]">--</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-50 rounded-lg flex items-center px-3 gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded w-20" />
                            <div className="h-2 bg-gray-100 rounded w-16 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppBanner;
