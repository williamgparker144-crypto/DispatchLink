import React from 'react';
import { Star, MapPin, Clock, Shield, MessageCircle, ChevronRight } from 'lucide-react';

interface DispatcherCardProps {
  dispatcher: {
    id: string;
    name: string;
    company: string;
    image: string;
    rating: number;
    reviews: number;
    experience: number;
    specialties: string[];
    tier: 'basic' | 'premier';
    verified: boolean;
  };
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

const DispatcherCard: React.FC<DispatcherCardProps> = ({ dispatcher, onViewProfile, onContact }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
      {/* Header with Image */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F]/80" />
        <div className="absolute -bottom-10 left-6">
          <div className="relative">
            <img
              src={dispatcher.image}
              alt={dispatcher.name}
              className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg"
            />
            {dispatcher.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
        {/* Verified badge */}
      </div>

      {/* Content */}
      <div className="pt-12 p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1E3A5F] text-lg group-hover:text-[#3B82F6] transition-colors">
              {dispatcher.name}
            </h3>
            <p className="text-sm text-gray-500">{dispatcher.company}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700">{dispatcher.rating}</span>
            <span className="text-xs text-gray-400">({dispatcher.reviews})</span>
          </div>
        </div>

        {/* Experience */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{dispatcher.experience} years experience</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {dispatcher.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[#1E3A5F]/5 text-[#1E3A5F] text-xs font-medium rounded-lg"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewProfile(dispatcher.id)}
            className="flex-1 py-2 px-4 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/80 transition-colors flex items-center justify-center gap-1"
          >
            View Profile
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onContact(dispatcher.id)}
            className="py-2 px-4 border border-[#1E3A5F] text-[#1E3A5F] rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatcherCard;
