import React from 'react';
import { Star, MapPin, Truck, Shield, Users, ChevronRight, FileCheck, UserPlus } from 'lucide-react';
import ConnectionButton from './ConnectionButton';

interface CarrierCardProps {
  carrier: {
    id: string;
    name: string;
    company: string;
    image: string;
    rating: number;
    reviews: number;
    dotNumber: string;
    mcNumber: string;
    fleetSize: number;
    equipmentTypes: string[];
    regions: string[];
    verified: boolean;
    insuranceVerified: boolean;
  };
  onViewProfile: (id: string) => void;
  onRequestPermission: (id: string) => void;
}

const CarrierCard: React.FC<CarrierCardProps> = ({ carrier, onViewProfile, onRequestPermission }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
      {/* Header */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]" />
        <div className="absolute -bottom-10 left-6">
          <div className="relative cursor-pointer" onClick={() => onViewProfile(carrier.id)}>
            <img
              src={carrier.image}
              alt={carrier.company}
              className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg"
            />
            {carrier.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          {carrier.insuranceVerified && (
            <div className="bg-white/90 text-green-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              Insured
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3
              className="font-bold text-[#1E3A5F] text-lg group-hover:text-[#3B82F6] transition-colors cursor-pointer hover:underline"
              onClick={() => onViewProfile(carrier.id)}
            >
              {carrier.company}
            </h3>
            <p
              className="text-sm text-gray-500 cursor-pointer hover:underline"
              onClick={() => onViewProfile(carrier.id)}
            >
              {carrier.name}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700">{carrier.rating}</span>
          </div>
        </div>

        {/* DOT/MC Numbers */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">DOT #</p>
            <p className="text-sm font-semibold text-[#1E3A5F]">{carrier.dotNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">MC #</p>
            <p className="text-sm font-semibold text-[#1E3A5F]">{carrier.mcNumber}</p>
          </div>
        </div>

        {/* Fleet Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-gray-400" />
            <span>{carrier.fleetSize} trucks</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{carrier.regions[0]}</span>
          </div>
        </div>

        {/* Equipment Types */}
        <div className="flex flex-wrap gap-2 mb-4">
          {carrier.equipmentTypes.slice(0, 3).map((type, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium rounded-lg"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewProfile(carrier.id)}
            className="flex-1 py-2 px-4 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/80 transition-colors flex items-center justify-center gap-1"
          >
            View Profile
            <ChevronRight className="w-4 h-4" />
          </button>
          <ConnectionButton targetUserId={carrier.id} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default CarrierCard;
