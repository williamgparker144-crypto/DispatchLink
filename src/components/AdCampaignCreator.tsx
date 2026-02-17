import React, { useState, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Megaphone, ImageIcon, Eye, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { createAdCampaign, createAdCreative, uploadAdCreativeImage } from '@/lib/api';

interface AdCampaignCreatorProps {
  onClose: () => void;
  onCreated: () => void;
}

const AD_FORMATS = [
  { id: 'feed_post', label: 'Feed Post', desc: 'Appears in user feeds as a sponsored post' },
  { id: 'directory_spotlight', label: 'Directory Spotlight', desc: 'Featured listing in directories' },
  { id: 'banner', label: 'Banner', desc: 'Banner placement across key pages' },
];

const USER_TYPES = [
  { id: 'dispatcher', label: 'Dispatchers' },
  { id: 'carrier', label: 'Carriers' },
  { id: 'broker', label: 'Brokers' },
];

const REGIONS = [
  'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Pacific Northwest', 'Nationwide',
];

const AdCampaignCreator: React.FC<AdCampaignCreatorProps> = ({ onClose, onCreated }) => {
  const { currentUser } = useAppContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const imageRef = useRef<HTMLInputElement>(null);

  // Step 1: Basics
  const [campaignName, setCampaignName] = useState('');
  const [adFormat, setAdFormat] = useState('feed_post');
  const [budgetNotes, setBudgetNotes] = useState('');

  // Step 2: Targeting
  const [targetTypes, setTargetTypes] = useState<string[]>(['dispatcher', 'carrier', 'broker']);
  const [targetRegions, setTargetRegions] = useState<string[]>([]);

  // Step 3: Creative
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ctaText, setCtaText] = useState('Learn More');
  const [ctaUrl, setCtaUrl] = useState('');

  const toggleTargetType = (id: string) => {
    setTargetTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleRegion = (region: string) => {
    setTargetRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return campaignName.trim().length > 0;
      case 2: return targetTypes.length > 0;
      case 3: return headline.trim().length > 0 && bodyText.trim().length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');

    try {
      const campaign = await createAdCampaign({
        advertiserId: currentUser.id,
        name: campaignName,
        adFormat,
        targetUserTypes: targetTypes,
        targetRegions: targetRegions.length > 0 ? targetRegions : ['Nationwide'],
        budgetNotes: budgetNotes || undefined,
      });

      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadAdCreativeImage(campaign.id, imageFile);
      }

      await createAdCreative({
        campaignId: campaign.id,
        headline,
        bodyText,
        imageUrl,
        ctaText: ctaText || 'Learn More',
        ctaUrl: ctaUrl || undefined,
      });

      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            s === step ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white' :
            s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {s < step ? <CheckCircle className="w-4 h-4" /> : s}
          </div>
          {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-6 h-6 text-[#F59E0B]" />
            <h2 className="text-xl font-bold text-[#1E3A5F]">Create Campaign</h2>
          </div>

          {renderStepIndicator()}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1E3A5F]">Campaign Basics</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="e.g., Summer Promo 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Format *</label>
                <div className="space-y-2">
                  {AD_FORMATS.map(format => (
                    <label key={format.id} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${adFormat === format.id ? 'border-[#F59E0B] bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="adFormat" value={format.id} checked={adFormat === format.id} onChange={() => setAdFormat(format.id)} className="mt-0.5 accent-[#F59E0B]" />
                      <div>
                        <p className="text-sm font-semibold text-[#1E3A5F]">{format.label}</p>
                        <p className="text-xs text-gray-500">{format.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Notes</label>
                <textarea value={budgetNotes} onChange={e => setBudgetNotes(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none" rows={2} placeholder="Your budget range or preferences (optional)" />
              </div>
            </div>
          )}

          {/* Step 2: Targeting */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1E3A5F]">Targeting</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target User Types</label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPES.map(type => (
                    <button key={type.id} onClick={() => toggleTargetType(type.id)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${targetTypes.includes(type.id) ? 'bg-[#F59E0B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Regions</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(region => (
                    <button key={region} onClick={() => toggleRegion(region)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${targetRegions.includes(region) ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {region}
                    </button>
                  ))}
                </div>
                {targetRegions.length === 0 && <p className="text-xs text-gray-400 mt-1">Leave empty for nationwide targeting</p>}
              </div>
            </div>
          )}

          {/* Step 3: Creative */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1E3A5F]">Ad Creative</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline *</label>
                <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="Your attention-grabbing headline" maxLength={100} />
                <p className="text-xs text-gray-400 mt-1">{headline.length}/100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Text *</label>
                <textarea value={bodyText} onChange={e => setBodyText(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none" rows={3} placeholder="Describe your product or service..." maxLength={500} />
                <p className="text-xs text-gray-400 mt-1">{bodyText.length}/500</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Ad preview" className="h-32 w-auto rounded-xl object-cover border border-gray-200" />
                    <button onClick={() => { setImagePreview(''); setImageFile(null); }} className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => imageRef.current?.click()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                  <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="Learn More" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
                  <input type="url" value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="https://..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1E3A5F] flex items-center gap-2"><Eye className="w-5 h-5" /> Preview & Submit</h3>

              {/* Feed-style preview */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2 flex items-center justify-between bg-amber-50/50 border-b border-amber-100/50">
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" />
                    Sponsored
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Ad</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{currentUser?.businessName?.charAt(0) || currentUser?.company?.charAt(0) || 'A'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{currentUser?.businessName || currentUser?.company || 'Your Business'}</p>
                      <p className="text-xs text-amber-600 font-medium">Sponsored</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mt-3">{headline || 'Your Headline'}</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{bodyText || 'Your ad body text...'}</p>
                  {imagePreview && <img src={imagePreview} alt="Ad" className="mt-3 rounded-lg w-full h-40 object-cover" />}
                  {ctaUrl && (
                    <button className="mt-3 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-lg text-xs font-semibold">
                      {ctaText || 'Learn More'}
                    </button>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Campaign</span><span className="font-semibold text-[#1E3A5F]">{campaignName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Format</span><span className="font-semibold text-[#1E3A5F]">{AD_FORMATS.find(f => f.id === adFormat)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Targeting</span><span className="font-semibold text-[#1E3A5F]">{targetTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Regions</span><span className="font-semibold text-[#1E3A5F]">{targetRegions.length > 0 ? targetRegions.join(', ') : 'Nationwide'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status after submit</span><span className="font-semibold text-blue-600">Pending Review</span></div>
              </div>

              <p className="text-xs text-gray-400 text-center">Your campaign will be reviewed before going live. Our team will contact you regarding pricing.</p>
            </div>
          )}

          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-[#1E3A5F] text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="flex items-center gap-1 px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl disabled:opacity-50 transition-all">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl disabled:opacity-50 transition-all">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Submit Campaign</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCampaignCreator;
