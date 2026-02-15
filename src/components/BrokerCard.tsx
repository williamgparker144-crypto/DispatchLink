import React from 'react';
import { Star, MapPin, Shield, ChevronRight, Briefcase, Clock } from 'lucide-react';
import ConnectionButton from './ConnectionButton';

interface BrokerCardProps {
  broker: {
    id: string;
    name: string;
    company: string;
    image?: string;
    rating: number;
    reviews: number;
    mcNumber: string;
    specialties: string[];
    regions: string[];
    verified: boolean;
    yearsInBusiness: number;
  };
  onViewProfile: (id: string) => void;
}

const BrokerCard: React.FC<BrokerCardProps> = ({ broker, onViewProfile }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
      {/* Header */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-purple-600 to-purple-800" />
        <div className="absolute -bottom-10 left-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
              {broker.image ? (
                <img src={broker.image} alt={broker.company} className="w-full h-full rounded-lg object-cover" />
              ) : (
                <span className="text-2xl font-bold text-purple-600">{broker.company.charAt(0)}</span>
              )}
            </div>
            {broker.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1E3A5F] text-lg group-hover:text-purple-600 transition-colors">
              {broker.company}
            </h3>
            <p className="text-sm text-gray-500">{broker.name}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700">{broker.rating}</span>
          </div>
        </div>

        {/* MC Number */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">MC #</p>
          <p className="text-sm font-semibold text-[#1E3A5F]">{broker.mcNumber}</p>
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{broker.yearsInBusiness} years</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{broker.regions[0]}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {broker.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewProfile(broker.id)}
            className="flex-1 py-2 px-4 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/80 transition-colors flex items-center justify-center gap-1"
          >
            View Profile
            <ChevronRight className="w-4 h-4" />
          </button>
          <ConnectionButton status="none" onConnect={() => {}} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default BrokerCard;
