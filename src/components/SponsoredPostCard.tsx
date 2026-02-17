import React, { useEffect, useRef } from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { recordAdEvent } from '@/lib/api';
import { useAppContext } from '@/contexts/AppContext';
import type { SponsoredPost } from '@/types';

interface SponsoredPostCardProps {
  sponsoredPost: SponsoredPost;
}

const SponsoredPostCard: React.FC<SponsoredPostCardProps> = ({ sponsoredPost }) => {
  const { currentUser } = useAppContext();
  const impressionRecorded = useRef(false);

  const { campaign, creative, advertiserName, advertiserImage } = sponsoredPost;

  // Record impression on mount
  useEffect(() => {
    if (impressionRecorded.current) return;
    impressionRecorded.current = true;
    recordAdEvent(creative.id, campaign.id, currentUser?.id, 'impression');
  }, [creative.id, campaign.id, currentUser?.id]);

  const handleCtaClick = () => {
    recordAdEvent(creative.id, campaign.id, currentUser?.id, 'click');
    if (creative.cta_url) {
      window.open(creative.cta_url, '_blank', 'noopener,noreferrer');
    }
  };

  const initial = advertiserName?.charAt(0) || 'A';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
      {/* Sponsored header */}
      <div className="px-4 py-2 flex items-center justify-between bg-amber-50/50 border-b border-amber-100/50">
        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5" />
          Sponsored
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Ad</span>
      </div>

      <div className="p-4">
        {/* Advertiser info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            {advertiserImage ? (
              <img src={advertiserImage} alt={advertiserName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{advertiserName}</p>
            <p className="text-xs text-amber-600 font-medium">Sponsored</p>
          </div>
        </div>

        {/* Creative content */}
        <h4 className="font-bold text-gray-900 text-sm">{creative.headline}</h4>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{creative.body_text}</p>

        {creative.image_url && (
          <img
            src={creative.image_url}
            alt={creative.headline}
            className="mt-3 rounded-lg w-full max-h-64 object-cover"
          />
        )}

        {/* CTA button */}
        {creative.cta_url && (
          <button
            onClick={handleCtaClick}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 hover:shadow-md transition-shadow"
          >
            {creative.cta_text || 'Learn More'}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SponsoredPostCard;
