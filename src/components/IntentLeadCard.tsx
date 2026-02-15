import React from 'react';
import { Building, Mail, Phone, Clock, Eye, Target, ChevronRight } from 'lucide-react';

interface IntentLeadCardProps {
  lead: {
    id: string;
    company: string;
    contact: string;
    email: string;
    phone: string;
    source: string;
    query: string;
    score: number;
    status: 'new' | 'contacted' | 'converted' | 'closed';
    time: string;
  };
  onContact: (id: string) => void;
  onMarkContacted: (id: string) => void;
}

const IntentLeadCard: React.FC<IntentLeadCardProps> = ({ lead, onContact, onMarkContacted }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1a365d]/10 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-[#1a365d]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a365d]">{lead.company}</h3>
            <p className="text-sm text-gray-500">{lead.contact}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(lead.score)}`}>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {lead.score}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(lead.status)}`}>
            {lead.status}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Search Query:</span> "{lead.query}"
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {lead.source}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {lead.time}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff6b35]"
        >
          <Mail className="w-4 h-4" />
          {lead.email}
        </a>
        <a
          href={`tel:${lead.phone}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff6b35]"
        >
          <Phone className="w-4 h-4" />
          {lead.phone}
        </a>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onContact(lead.id)}
          className="flex-1 py-2 bg-[#ff6b35] text-white rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors flex items-center justify-center gap-1"
        >
          Contact Lead
          <ChevronRight className="w-4 h-4" />
        </button>
        {lead.status === 'new' && (
          <button
            onClick={() => onMarkContacted(lead.id)}
            className="py-2 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Mark Contacted
          </button>
        )}
      </div>
    </div>
  );
};

export default IntentLeadCard;
