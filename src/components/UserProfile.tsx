import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Edit3, MapPin, Briefcase, Shield, Users, MessageSquare, Eye, X, Check,
  ImageIcon, Globe, Link2, Palette, Upload, FileText, Heart, Share2, Bookmark,
  Award, Star, Calendar, Mail, Sparkles, Clock, Plus, Trash2, Loader2, AlertCircle, CheckCircle, Code, Grid, ExternalLink
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { CarrierReference } from '@/contexts/AppContext';
import { computeVerificationTier, getVerificationBadgeInfo } from '@/lib/verification';
import { verifyCarrierMC, verifyCarrierDOT } from '@/lib/fmcsa';
import { compressImage } from '@/lib/imageCompress';
import { uploadProfileImage, uploadCoverImage, uploadAgreementFile, getConnections, getPostsByUser, createPost, deletePost, uploadPostImage, uploadPostDocument, getProfileViewCount, saveGalleryImages, getGalleryImages } from '@/lib/api';
import PostCard from './PostCard';
import type { Post, ViewableUser } from '@/types';

const SPECIALTY_OPTIONS = ['Flatbed', 'Reefer', 'Dry Van', 'Hazmat', 'Tanker', 'Heavy Haul', 'Auto Transport', 'LTL', 'Expedited'];
const EXPERIENCE_OPTIONS = [
  { value: 0, label: 'Less than 1 year' },
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 5, label: '5 years' },
  { value: 7, label: '7+ years' },
  { value: 10, label: '10+ years' },
];

const normalizeUrl = (url: string) => url.match(/^https?:\/\//) ? url : `https://${url}`;

interface UserProfileProps {
  onNavigate: (view: string) => void;
  onViewProfile?: (user: ViewableUser) => void;
}

const COVER_THEMES = [
  { id: 'navy-blue', gradient: 'linear-gradient(135deg, #1E3A5F 0%, #2c5282 50%, #3B82F6 100%)' },
  { id: 'ocean', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 'sunset', gradient: 'linear-gradient(135deg, #1E3A5F 0%, #4a2c6b 50%, #8B5CF6 100%)' },
  { id: 'emerald', gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #10B981 100%)' },
  { id: 'midnight', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' },
  { id: 'royal', gradient: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #4f46e5 100%)' },
];

const UserProfile: React.FC<UserProfileProps> = ({ onNavigate, onViewProfile }) => {
  const { currentUser, updateProfile } = useAppContext();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [frameModalOpen, setFrameModalOpen] = useState(false);
  const [avatarFrame, setAvatarFrame] = useState<string>('none');
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'activity' | 'gallery' | 'embed'>('posts');

  // File upload refs
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null);
  const postImageRef = useRef<HTMLInputElement>(null);
  const postDocRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editCompany, setEditCompany] = useState(currentUser?.company || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || '');

  // Experience questionnaire state (dispatcher only)
  const [editYearsExperience, setEditYearsExperience] = useState<number>(currentUser?.yearsExperience ?? 0);
  const [editSpecialties, setEditSpecialties] = useState<string[]>(currentUser?.specialties ?? []);
  const [editCarriers, setEditCarriers] = useState<CarrierReference[]>(currentUser?.carriersWorkedWith ?? []);
  const [editCarrierScout, setEditCarrierScout] = useState(currentUser?.carrierScoutSubscribed ?? false);
  const [newCarrierName, setNewCarrierName] = useState('');
  const [newCarrierMC, setNewCarrierMC] = useState('');
  const [carrierIdType, setCarrierIdType] = useState<'mc' | 'dot'>('mc');
  const [carrierVerifying, setCarrierVerifying] = useState(false);
  const [carrierVerifyError, setCarrierVerifyError] = useState('');
  const [carrierVerifySuccess, setCarrierVerifySuccess] = useState('');
  const agreementFileRef = useRef<HTMLInputElement>(null);
  const [uploadingAgreementFor, setUploadingAgreementFor] = useState<number | null>(null);

  // Photo preview
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Raw file objects for Supabase Storage upload
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);

  // Cover theme
  const [selectedTheme, setSelectedTheme] = useState(COVER_THEMES[0].gradient);

  // Connection count from Supabase
  const [connectionCount, setConnectionCount] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  useEffect(() => {
    if (!currentUser?.id) return;
    const isSupabaseId = !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (!isSupabaseId) return;
    (async () => {
      try {
        const accepted = await getConnections(currentUser.id);
        setConnectionCount(accepted?.length || 0);
      } catch { /* keep 0 */ }
    })();
    // Fetch profile view count
    getProfileViewCount(currentUser.id).then(count => setProfileViews(count)).catch(() => {});
  }, [currentUser?.id]);

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryLightboxUrl, setGalleryLightboxUrl] = useState<string | null>(null);
  const galleryUploadRef = useRef<HTMLInputElement>(null);

  // Embed codes
  const [embedCodes, setEmbedCodes] = useState<{ id: string; label: string; code: string }[]>([]);
  const [newEmbedLabel, setNewEmbedLabel] = useState('');
  const [newEmbedCode, setNewEmbedCode] = useState('');

  // Load gallery + embeds from Supabase (with localStorage fallback)
  useEffect(() => {
    if (!currentUser?.id) return;
    const isSupabaseId = !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    // Load gallery from Supabase first, fall back to localStorage
    if (isSupabaseId) {
      getGalleryImages(currentUser.id).then(urls => {
        if (urls.length > 0) {
          setGalleryImages(urls);
          localStorage.setItem(`dispatchlink_gallery_${currentUser.id}`, JSON.stringify(urls));
        } else {
          // Fall back to localStorage (migrates existing local data)
          const stored = localStorage.getItem(`dispatchlink_gallery_${currentUser.id}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setGalleryImages(parsed);
              if (parsed.length > 0) saveGalleryImages(currentUser.id, parsed); // migrate to DB
            } catch {}
          }
        }
      }).catch(() => {
        const stored = localStorage.getItem(`dispatchlink_gallery_${currentUser.id}`);
        if (stored) try { setGalleryImages(JSON.parse(stored)); } catch {}
      });
    } else {
      const stored = localStorage.getItem(`dispatchlink_gallery_${currentUser.id}`);
      if (stored) try { setGalleryImages(JSON.parse(stored)); } catch {}
    }
    const storedEmbeds = localStorage.getItem(`dispatchlink_embeds_${currentUser.id}`);
    if (storedEmbeds) try { setEmbedCodes(JSON.parse(storedEmbeds)); } catch {}
  }, [currentUser?.id]);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentUser?.id) return;
    setGalleryUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadPostImage(currentUser.id, file);
        if (url) newUrls.push(url);
      } catch {}
    }
    if (newUrls.length > 0) {
      const updated = [...galleryImages, ...newUrls];
      setGalleryImages(updated);
      localStorage.setItem(`dispatchlink_gallery_${currentUser.id}`, JSON.stringify(updated));
      saveGalleryImages(currentUser.id, updated); // persist to Supabase
    }
    setGalleryUploading(false);
    if (galleryUploadRef.current) galleryUploadRef.current.value = '';
  };

  const removeGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (currentUser?.id) {
      localStorage.setItem(`dispatchlink_gallery_${currentUser.id}`, JSON.stringify(updated));
      saveGalleryImages(currentUser.id, updated);
    }
  };

  const handleAddEmbed = () => {
    if (!newEmbedCode.trim() || !currentUser?.id) return;
    const newEmbed = { id: `embed-${Date.now()}`, label: newEmbedLabel.trim() || 'Untitled', code: newEmbedCode.trim() };
    const updated = [...embedCodes, newEmbed];
    setEmbedCodes(updated);
    localStorage.setItem(`dispatchlink_embeds_${currentUser.id}`, JSON.stringify(updated));
    setNewEmbedLabel('');
    setNewEmbedCode('');
  };

  const removeEmbed = (id: string) => {
    const updated = embedCodes.filter(e => e.id !== id);
    setEmbedCodes(updated);
    if (currentUser?.id) localStorage.setItem(`dispatchlink_embeds_${currentUser.id}`, JSON.stringify(updated));
  };

  // Personal feed
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postDoc, setPostDoc] = useState<{ name: string; url: string; file?: File } | null>(null);
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Fetch user's posts from Supabase
  useEffect(() => {
    if (!currentUser?.id) return;
    const isSupabaseId = !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (!isSupabaseId) {
      setPostsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getPostsByUser(currentUser.id, currentUser.id);
        if (!cancelled) setPosts(data);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <section className="page-bg min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Sign in to view your profile</h2>
            <p className="text-gray-500 mb-6">Create an account or sign in to access your dashboard.</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 btn-glossy-primary rounded-xl transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  // File upload handlers
  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const raw = reader.result as string;
      const compressed = await compressImage(raw);
      setPhotoPreview(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfilePhoto = async () => {
    if (!photoPreview) return;
    const isSupabaseUser = currentUser && !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (isSupabaseUser && profilePhotoFile) {
      try {
        const publicUrl = await uploadProfileImage(currentUser!.id, profilePhotoFile);
        updateProfile({ image: publicUrl });
      } catch (err) {
        console.warn('Storage upload failed, falling back to base64:', err);
        updateProfile({ image: photoPreview });
      }
    } else {
      updateProfile({ image: photoPreview });
    }
    setPhotoModalOpen(false);
    setPhotoPreview(null);
    setProfilePhotoFile(null);
  };

  const handleRemovePhoto = () => {
    updateProfile({ image: undefined });
    setPhotoModalOpen(false);
    setPhotoPreview(null);
  };

  const handleCoverPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPhotoFile(file);
    // Use full-quality preview for cover photos — don't compress
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCoverPhoto = async () => {
    if (!coverPreview) return;
    const isSupabaseUser = currentUser && !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (isSupabaseUser && coverPhotoFile) {
      try {
        const publicUrl = await uploadCoverImage(currentUser!.id, coverPhotoFile);
        updateProfile({ coverImage: publicUrl });
      } catch (err) {
        console.warn('Cover upload failed, compressing for localStorage:', err);
        // Compress only as last resort for localStorage
        const compressed = await compressImage(coverPreview);
        updateProfile({ coverImage: compressed });
      }
    } else {
      const compressed = await compressImage(coverPreview);
      updateProfile({ coverImage: compressed });
    }
    setCoverModalOpen(false);
    setCoverPreview(null);
    setCoverPhotoFile(null);
  };

  const handleSaveTheme = () => {
    // Remove cover image and use gradient theme
    updateProfile({ coverImage: selectedTheme });
    setThemeModalOpen(false);
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePostDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostDoc({ name: file.name, url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const updates: Record<string, any> = {
      name: editName,
      company: editCompany,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
    };
    if (currentUser?.userType === 'dispatcher') {
      updates.yearsExperience = editYearsExperience;
      updates.specialties = editSpecialties;
      updates.carriersWorkedWith = editCarriers;
      updates.carrierScoutSubscribed = editCarrierScout;
    }
    updateProfile(updates);
    setEditModalOpen(false);
  };

  const handleAddCarrier = async () => {
    if (!newCarrierMC.trim()) {
      setCarrierVerifyError(`Please enter a ${carrierIdType === 'mc' ? 'MC' : 'USDOT'} number.`);
      return;
    }
    const input = newCarrierMC.trim().toUpperCase();
    const normalizedNum = input.replace(/[^0-9]/g, '');

    // Check for duplicates
    if (editCarriers.some(c => c.mcNumber.replace(/[^0-9]/g, '') === normalizedNum)) {
      setCarrierVerifyError('This carrier is already in your list.');
      return;
    }

    setCarrierVerifying(true);
    setCarrierVerifyError('');
    setCarrierVerifySuccess('');

    try {
      const result = carrierIdType === 'dot'
        ? await verifyCarrierDOT(input)
        : await verifyCarrierMC(input);

      const idLabel = carrierIdType === 'dot' ? 'USDOT#' : 'MC#';
      const idDisplay = carrierIdType === 'dot'
        ? (result.dotNumber || `DOT${normalizedNum}`)
        : result.mcNumber;

      if (result.found && result.active) {
        const carrierName = result.legalName || newCarrierName.trim() || 'Unknown';
        setEditCarriers(prev => [...prev, {
          carrierName,
          mcNumber: idDisplay,
          verified: true,
        }]);
        setCarrierVerifySuccess(`FMCSA Verified: ${carrierName} (${idDisplay}) — Active status confirmed.`);
        setNewCarrierName('');
        setNewCarrierMC('');
      } else if (result.found && !result.active) {
        setCarrierVerifyError(
          `${idLabel} ${idDisplay} (${result.legalName}) was found in FMCSA but does not have active status. Only active carriers can be added.`
        );
      } else {
        const carrierName = newCarrierName.trim();
        if (!carrierName) {
          setCarrierVerifyError(`FMCSA could not verify this ${idLabel}. Please enter the carrier name manually and upload your dispatch agreement as proof.`);
          setCarrierVerifying(false);
          return;
        }
        const fallbackId = carrierIdType === 'dot'
          ? (normalizedNum ? `DOT${normalizedNum}` : input)
          : (normalizedNum ? `MC${normalizedNum}` : input);
        setEditCarriers(prev => [...prev, {
          carrierName,
          mcNumber: fallbackId,
          verified: false,
        }]);
        setCarrierVerifySuccess(
          `${carrierName} added — pending document verification. Please upload your dispatch agreement below to verify this carrier relationship.`
        );
        setNewCarrierName('');
        setNewCarrierMC('');
      }
    } catch {
      setCarrierVerifyError('Verification service error. Please try again.');
    } finally {
      setCarrierVerifying(false);
    }
  };

  const handleRemoveCarrier = (index: number) => {
    setEditCarriers(prev => prev.filter((_, i) => i !== index));
  };

  const handleAgreementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingAgreementFor === null) return;
    const idx = uploadingAgreementFor;
    const carrier = editCarriers[idx];
    const isSupabaseUser = currentUser && !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');

    let storagePath: string | undefined;
    if (isSupabaseUser) {
      try {
        storagePath = await uploadAgreementFile(currentUser!.id, carrier.mcNumber, file);
      } catch (err) {
        console.warn('Agreement upload to storage failed:', err);
      }
    }

    setEditCarriers(prev =>
      prev.map((c, i) =>
        i === idx
          ? { ...c, agreementFileName: file.name, agreementUploadedAt: new Date().toISOString() }
          : c
      )
    );
    setUploadingAgreementFor(null);
    if (agreementFileRef.current) agreementFileRef.current.value = '';
  };

  const toggleEditSpecialty = (specialty: string) => {
    setEditSpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !postImage && !postDoc) return;
    setPostSubmitting(true);
    try {
      let imageUrl = postImage || undefined;
      let docUrl = postDoc?.url || undefined;
      let docName = postDoc?.name || undefined;

      // Upload image to Supabase Storage if it's a file
      if (postImageFile) {
        const uploaded = await uploadPostImage(currentUser.id, postImageFile);
        imageUrl = uploaded || undefined;
      }
      // Upload document to Supabase Storage if it's a file
      if (postDoc?.file) {
        const uploaded = await uploadPostDocument(currentUser.id, postDoc.file);
        docUrl = uploaded || undefined;
      }

      const saved = await createPost({
        author_id: currentUser.id,
        content: newPostContent,
        post_type: 'update',
        image_url: imageUrl,
        document_url: docUrl,
        document_name: docName,
      });

      if (saved) {
        const newPost: Post = {
          id: saved.id,
          author_id: currentUser.id,
          author_name: currentUser.name,
          author_company: currentUser.company,
          author_type: currentUser.userType,
          author_image: currentUser.image,
          author_verified: currentUser.verified,
          content: newPostContent,
          post_type: 'update',
          likes_count: 0,
          comments_count: 0,
          liked_by_current_user: false,
          created_at: saved.created_at || new Date().toISOString(),
          image_url: imageUrl,
          document_url: docUrl,
          document_name: docName,
        };
        setPosts(prev => [newPost, ...prev]);
      }
      setNewPostContent('');
      setPostImage(null);
      setPostImageFile(null);
      setPostDoc(null);
    } catch (err) {
      console.warn('Failed to create post:', err);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      // Still remove from local state
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  const userInitial = currentUser.name?.charAt(0) || '?';

  const getTypeBadge = () => {
    switch (currentUser.userType) {
      case 'dispatcher': return 'Dispatcher';
      case 'carrier': return 'Carrier';
      case 'broker': return 'Broker';
      case 'advertiser': return 'Advertiser';
      default: return '';
    }
  };

  const getTypeBadgeColor = () => {
    switch (currentUser.userType) {
      case 'dispatcher': return 'bg-blue-100 text-blue-700';
      case 'carrier': return 'bg-orange-100 text-orange-700';
      case 'broker': return 'bg-purple-100 text-purple-700';
      case 'advertiser': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Determine if cover is an uploaded image or a gradient theme
  const isUploadedCover =
    currentUser.coverImage?.startsWith('data:') || currentUser.coverImage?.startsWith('http');
  const isGradientCover = currentUser.coverImage?.startsWith('linear-gradient');

  const coverGradientStyle: React.CSSProperties = isGradientCover
    ? { background: currentUser.coverImage }
    : !isUploadedCover
      ? { background: 'linear-gradient(135deg, #1E3A5F 0%, #2c5282 50%, #3B82F6 100%)' }
      : {};

  return (
    <section className="page-bg min-h-screen pb-12">
      {/* Hidden file inputs */}
      <input ref={profilePhotoRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoSelect} />
      <input ref={coverPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoSelect} />
      <input ref={postImageRef} type="file" accept="image/*" className="hidden" onChange={handlePostImageSelect} />
      <input ref={postDocRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="hidden" onChange={handlePostDocSelect} />

      {/* Cover Photo */}
      <div className="h-56 sm:h-72 relative group overflow-hidden" style={!isUploadedCover ? coverGradientStyle : undefined}>
        {/* Uploaded image — clean, no overlays */}
        {isUploadedCover && (
          <img
            src={currentUser.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Pattern overlay — gradient themes ONLY */}
        {!isUploadedCover && (
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        )}

        {/* Subtle bottom gradient for text readability — lighter for photos */}
        <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t to-transparent ${isUploadedCover ? 'from-black/15' : 'from-black/20'}`} />

        {/* Cover photo actions - visible on hover */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => setCoverModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-black/60 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Edit Cover Photo
          </button>
          <button
            onClick={() => setThemeModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-black/60 transition-colors"
          >
            <Palette className="w-4 h-4" />
            Theme
          </button>
        </div>

        {/* Always-visible camera icon for mobile - hides when full buttons appear */}
        <button
          onClick={() => setCoverModalOpen(true)}
          className="absolute bottom-3 right-3 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all group-hover:opacity-0 z-10"
          title="Edit Cover Photo"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile Header Card */}
        <div className="relative -mt-16 mb-6">
          {/* Avatar - positioned above card to prevent overflow issues */}
          <div className="relative z-10 pl-6 group/avatar" style={{ marginBottom: '-64px' }}>
            <div className="relative inline-block">
              <div
                className={`w-32 h-32 rounded-full shadow-lg bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden cursor-pointer avatar-frame-${avatarFrame}`}
                onClick={() => setPhotoModalOpen(true)}
              >
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-5xl">{userInitial}</span>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#10B981] border-[3px] border-white rounded-full z-10"></div>
              {/* Frame customization button */}
              <button
                onClick={(e) => { e.stopPropagation(); setFrameModalOpen(true); }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-500 hover:text-[#8B5CF6] hover:border-[#8B5CF6] transition-colors shadow-sm opacity-0 group-hover/avatar:opacity-100 z-10 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Frame
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 pb-6 pt-[72px]">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Name & Info */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-[#1E3A5F]">{currentUser.name}</h1>
                    {currentUser.verified && <Shield className="w-5 h-5 text-[#3B82F6]" />}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeColor()}`}>
                      {getTypeBadge()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1.5 flex-wrap">
                    {currentUser.company && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {currentUser.company}
                      </span>
                    )}
                    {currentUser.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {currentUser.location}
                      </span>
                    )}
                    {currentUser.website && (
                      <a
                        href={normalizeUrl(currentUser.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#3B82F6] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {currentUser.website}
                      </a>
                    )}
                  </div>
                  {currentUser.bio && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{currentUser.bio}</p>
                  )}
                </div>

                {/* Edit Button - glossy */}
                <button
                  onClick={() => {
                    setEditName(currentUser.name);
                    setEditCompany(currentUser.company);
                    setEditBio(currentUser.bio || '');
                    setEditLocation(currentUser.location || '');
                    setEditWebsite(currentUser.website || '');
                    setEditYearsExperience(currentUser.yearsExperience ?? 0);
                    setEditSpecialties(currentUser.specialties ?? []);
                    setEditCarriers(currentUser.carriersWorkedWith ?? []);
                    setEditCarrierScout(currentUser.carrierScoutSubscribed ?? false);
                    setNewCarrierName('');
                    setNewCarrierMC('');
                    setEditModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 btn-glossy-outline rounded-xl text-sm transition-all flex-shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="border-t border-gray-100 px-6 py-4 grid grid-cols-3 gap-4">
              <button onClick={() => onNavigate('connections')} className="text-center hover:bg-gray-50 rounded-lg py-2 transition-colors">
                <p className="text-xl font-bold text-[#1E3A5F]">{connectionCount}</p>
                <p className="text-xs text-gray-500 font-medium">Connections</p>
              </button>
              <div className="text-center py-2">
                <p className="text-xl font-bold text-[#1E3A5F]">{posts.length}</p>
                <p className="text-xs text-gray-500 font-medium">Posts</p>
              </div>
              <div className="text-center py-2">
                <p className="text-xl font-bold text-[#1E3A5F]">{profileViews}</p>
                <p className="text-xs text-gray-500 font-medium">Profile Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button onClick={() => onNavigate('feed')} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all group">
            <Eye className="w-5 h-5 text-[#3B82F6] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-gray-700">View Feed</span>
          </button>
          <button onClick={() => onNavigate('connections')} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all group">
            <Users className="w-5 h-5 text-[#10B981] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-gray-700">Connections</span>
          </button>
          <button onClick={() => onNavigate('messages')} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all group">
            <MessageSquare className="w-5 h-5 text-[#F59E0B] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-gray-700">Messages</span>
          </button>
          <button onClick={() => setPhotoModalOpen(true)} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all group">
            <Camera className="w-5 h-5 text-[#8B5CF6] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-gray-700">Change Photo</span>
          </button>
        </div>

        {/* Profile Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'posts' as const, label: 'Posts', icon: <Edit3 className="w-4 h-4" /> },
              { id: 'about' as const, label: 'About', icon: <Users className="w-4 h-4" /> },
              { id: 'gallery' as const, label: 'Gallery', icon: <Grid className="w-4 h-4" /> },
              { id: 'embed' as const, label: 'Embed', icon: <Code className="w-4 h-4" /> },
              { id: 'activity' as const, label: 'Activity', icon: <Star className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#3B82F6] border-[#3B82F6]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Professional Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-24">Role</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeColor()}`}>
                      {getTypeBadge()}
                    </span>
                  </div>
                  {currentUser.company && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-24">Company</span>
                      <span className="text-gray-800 font-medium">{currentUser.company}</span>
                    </div>
                  )}
                  {currentUser.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-24">Location</span>
                      <span className="text-gray-800">{currentUser.location}</span>
                    </div>
                  )}
                  {currentUser.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-24">Website</span>
                      <a
                        href={normalizeUrl(currentUser.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] hover:underline"
                      >
                        {currentUser.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-24">Email</span>
                    <span className="text-gray-800">{currentUser.email}</span>
                  </div>
                </div>
              </div>

              {currentUser.bio && (
                <div>
                  <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{currentUser.bio}</p>
                </div>
              )}

              {/* Dispatcher Experience Section */}
              {currentUser.userType === 'dispatcher' && (currentUser.yearsExperience !== undefined || (currentUser.specialties && currentUser.specialties.length > 0)) && (
                <div>
                  <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Dispatch Experience
                  </h3>
                  <div className="space-y-3">
                    {currentUser.yearsExperience !== undefined && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 w-24">Experience</span>
                        <span className="text-gray-800 font-medium">
                          {currentUser.yearsExperience === 0 ? 'Less than 1 year' : `${currentUser.yearsExperience}+ years`}
                        </span>
                      </div>
                    )}
                    {currentUser.specialties && currentUser.specialties.length > 0 && (
                      <div className="flex items-start gap-3 text-sm">
                        <span className="text-gray-500 w-24 pt-0.5">Specialties</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentUser.specialties.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-[#1E3A5F]/5 text-[#1E3A5F] text-xs font-medium rounded-lg">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentUser.carriersWorkedWith && currentUser.carriersWorkedWith.length > 0 && (
                      <div className="flex items-start gap-3 text-sm">
                        <span className="text-gray-500 w-24 pt-0.5">Carriers</span>
                        <div className="space-y-1.5">
                          {currentUser.carriersWorkedWith.map((c, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group"
                              onClick={() => {
                                const mcNum = c.mcNumber.replace(/[^0-9]/g, '');
                                const isDot = c.mcNumber.toUpperCase().startsWith('DOT');
                                window.open(
                                  isDot
                                    ? `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${mcNum}`
                                    : `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mcNum}`,
                                  '_blank'
                                );
                              }}
                            >
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3B82F6]" />
                              <span className="text-gray-800 group-hover:text-[#3B82F6] font-medium">{c.carrierName}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${c.mcNumber.toUpperCase().startsWith('DOT') ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                {c.mcNumber}
                              </span>
                              {c.verified && <Shield className="w-3.5 h-3.5 text-emerald-500" />}
                              <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#3B82F6] ml-auto" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.verified && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-blue-100">
                      <Shield className="w-3.5 h-3.5" />
                      Verified Member
                    </span>
                  )}
                  {currentUser.userType === 'dispatcher' && (() => {
                    const tier = computeVerificationTier(currentUser);
                    const badge = getVerificationBadgeInfo(tier);
                    return (
                      <span className={`px-3 py-1.5 ${badge.bgColor} ${badge.textColor} rounded-full text-xs font-semibold flex items-center gap-1.5 border ${badge.borderColor}`}>
                        <Shield className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                    );
                  })()}
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-green-100">
                    <Calendar className="w-3.5 h-3.5" />
                    New Member
                  </span>
                </div>
              </div>

              {(!currentUser.bio && !currentUser.location && !currentUser.website) && (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <Edit3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Complete your profile to stand out</p>
                  <button
                    onClick={() => {
                      setEditName(currentUser.name);
                      setEditCompany(currentUser.company);
                      setEditBio(currentUser.bio || '');
                      setEditLocation(currentUser.location || '');
                      setEditWebsite(currentUser.website || '');
                      setEditYearsExperience(currentUser.yearsExperience ?? 0);
                      setEditSpecialties(currentUser.specialties ?? []);
                      setEditCarriers(currentUser.carriersWorkedWith ?? []);
                      setEditCarrierScout(currentUser.carrierScoutSubscribed ?? false);
                      setNewCarrierName('');
                      setNewCarrierMC('');
                      setEditModalOpen(true);
                    }}
                    className="px-4 py-2 btn-glossy-primary rounded-lg text-sm transition-all"
                  >
                    Add Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="p-6">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
                  {posts.slice(0, 10).map(post => (
                    <div key={post.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Edit3 className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">
                          You shared {post.post_type === 'looking_for' ? 'a request' : `a${post.post_type === 'update' ? 'n update' : ` ${post.post_type}`}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {post.likes_count > 0 && (
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes_count}</span>
                          )}
                          {post.comments_count > 0 && (
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No activity yet</h3>
                  <p className="text-sm text-gray-400">Post updates to the feed to see your activity here.</p>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="p-6">
              <input
                ref={galleryUploadRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Photo Gallery</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Upload images to showcase your work, fleet, or business</p>
                </div>
                <button
                  onClick={() => galleryUploadRef.current?.click()}
                  disabled={galleryUploading}
                  className="flex items-center gap-2 px-4 py-2 btn-glossy-primary rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  {galleryUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Add Photos</>
                  )}
                </button>
              </div>

              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer" onClick={() => setGalleryLightboxUrl(url)}>
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeGalleryImage(i); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No photos yet</h3>
                  <p className="text-sm text-gray-400 mb-4">Upload photos of your fleet, warehouse, or team</p>
                  <button
                    onClick={() => galleryUploadRef.current?.click()}
                    className="px-5 py-2.5 btn-glossy-primary rounded-lg text-sm transition-all"
                  >
                    Upload Your First Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === 'embed' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Embed HTML</h3>
                <p className="text-xs text-gray-400">Add HTML embed codes to display flyers, logos, banners, or widgets on your profile</p>
              </div>

              {/* Add embed form */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-5">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                    <input
                      type="text"
                      value={newEmbedLabel}
                      onChange={(e) => setNewEmbedLabel(e.target.value)}
                      placeholder="e.g., Company Flyer, Logo Banner"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">HTML Code</label>
                    <textarea
                      value={newEmbedCode}
                      onChange={(e) => setNewEmbedCode(e.target.value)}
                      placeholder='<img src="https://..." alt="My Flyer" />'
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none bg-white resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAddEmbed}
                    disabled={!newEmbedCode.trim()}
                    className="flex items-center gap-2 px-4 py-2 btn-glossy-primary rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Embed
                  </button>
                </div>
              </div>

              {/* Existing embeds */}
              {embedCodes.length > 0 ? (
                <div className="space-y-4">
                  {embedCodes.map(embed => (
                    <div key={embed.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Code className="w-4 h-4 text-[#8B5CF6]" />
                          {embed.label}
                        </span>
                        <button
                          onClick={() => removeEmbed(embed.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div
                        className="p-4 overflow-auto max-h-[400px] [&>img]:max-w-full [&>img]:h-auto"
                        dangerouslySetInnerHTML={{ __html: embed.code }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No embeds yet</h3>
                  <p className="text-sm text-gray-400">Add HTML code above to display flyers, logos, or banners</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Composer - only visible on Posts tab */}
        {activeTab === 'posts' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-5 overflow-hidden">
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {currentUser.image ? (
                      <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{userInitial}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-gray-800 placeholder-gray-400 text-sm p-3 min-h-[60px] bg-gray-50/50 hover:bg-white transition-colors"
                      rows={2}
                    />

                    {/* Image preview */}
                    {postImage && (
                      <div className="mt-2 relative inline-block">
                        <img src={postImage} alt="Upload" className="h-24 w-auto rounded-xl object-cover border border-gray-200" />
                        <button
                          onClick={() => setPostImage(null)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Document preview */}
                    {postDoc && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                        <FileText className="w-4 h-4 text-[#3B82F6]" />
                        <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">{postDoc.name}</span>
                        <button
                          onClick={() => setPostDoc(null)}
                          className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center gap-2">
                <button
                  onClick={() => postImageRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-[#10B981]" />
                  <span className="hidden sm:inline text-xs">Photo</span>
                </button>
                <button
                  onClick={() => postDocRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition-all"
                >
                  <FileText className="w-4 h-4 text-[#F59E0B]" />
                  <span className="hidden sm:inline text-xs">Document</span>
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={postSubmitting || (!newPostContent.trim() && !postImage && !postDoc)}
                  className="ml-auto px-5 py-2 btn-glossy-navy rounded-full text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 flex items-center gap-2"
                >
                  {postSubmitting ? <><Loader2 className="w-3 h-3 animate-spin" /> Posting...</> : 'Post'}
                </button>
              </div>
            </div>

            {/* Personal Feed */}
            <div className="space-y-4">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading your posts...</span>
                </div>
              ) : (
                <>
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDeletePost} onViewProfile={onViewProfile} />
                  ))}
                  {posts.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">No posts yet</h3>
                      <p className="text-sm text-gray-400">Share your first update with the network above.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Edit Profile</h2>
                <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Globe className="w-3.5 h-3.5 inline mr-1" />
                    Website
                  </label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="www.yourcompany.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    placeholder="Tell others about yourself or your business..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none resize-none"
                  />
                </div>

                {/* Dispatcher Experience Questionnaire */}
                {currentUser.userType === 'dispatcher' && (
                  <>
                    <div className="pt-2 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-[#1E3A5F] mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Dispatch Experience
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
                      <select
                        value={editYearsExperience}
                        onChange={(e) => setEditYearsExperience(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none bg-white"
                      >
                        {EXPERIENCE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialties</label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALTY_OPTIONS.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleEditSpecialty(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                              editSpecialties.includes(s)
                                ? 'bg-[#3B82F6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Carriers Worked With</label>
                      <p className="text-xs text-gray-400 mb-2">Verify carriers by MC# (interstate) or USDOT# (intrastate/interstate). Upload your dispatch agreement to confirm the relationship.</p>

                      {/* Hidden file input for agreement uploads */}
                      <input
                        ref={agreementFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleAgreementUpload}
                      />

                      {editCarriers.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editCarriers.map((c, i) => (
                            <div key={i} className={`rounded-lg px-3 py-2 ${c.verified ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                              <div className="flex items-center gap-2">
                                {c.verified ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                )}
                                <span className="text-sm text-gray-800 flex-1">{c.carrierName}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${c.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {c.verified ? 'FMCSA Verified' : 'Pending'}
                                </span>
                                <span className={`text-xs font-medium ${c.mcNumber.startsWith('DOT') ? 'text-purple-600' : 'text-gray-500'}`}>
                                  {c.mcNumber}
                                </span>
                                <button type="button" onClick={() => handleRemoveCarrier(i)} className="text-red-400 hover:text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {/* Agreement upload row */}
                              <div className="mt-1.5 ml-6 flex items-center gap-2">
                                {c.agreementFileName ? (
                                  <div className="flex items-center gap-1.5 text-xs text-green-700">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{c.agreementFileName}</span>
                                    <span className="text-gray-400">uploaded</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadingAgreementFor(i);
                                      agreementFileRef.current?.click();
                                    }}
                                    className="flex items-center gap-1 text-xs text-[#3B82F6] hover:text-[#2563EB] font-medium"
                                  >
                                    <Upload className="w-3 h-3" />
                                    Upload Dispatch Agreement
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Identifier type toggle */}
                      <div className="flex items-center gap-1 mb-2 bg-gray-100 rounded-lg p-0.5 w-fit">
                        <button
                          type="button"
                          onClick={() => { setCarrierIdType('mc'); setCarrierVerifyError(''); setCarrierVerifySuccess(''); }}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            carrierIdType === 'mc'
                              ? 'bg-white text-[#1E3A5F] shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          MC#
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCarrierIdType('dot'); setCarrierVerifyError(''); setCarrierVerifySuccess(''); }}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            carrierIdType === 'dot'
                              ? 'bg-white text-[#1E3A5F] shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          USDOT#
                        </button>
                      </div>

                      {/* Add carrier form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCarrierName}
                          onChange={(e) => { setNewCarrierName(e.target.value); setCarrierVerifyError(''); setCarrierVerifySuccess(''); }}
                          placeholder="Carrier name (optional)"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                        />
                        <input
                          type="text"
                          value={newCarrierMC}
                          onChange={(e) => { setNewCarrierMC(e.target.value); setCarrierVerifyError(''); setCarrierVerifySuccess(''); }}
                          placeholder={carrierIdType === 'mc' ? 'MC#' : 'USDOT#'}
                          className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCarrier}
                          disabled={carrierVerifying}
                          className="px-3 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#1E3A5F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {carrierVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Status messages */}
                      {carrierVerifying && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Verifying {carrierIdType === 'mc' ? 'MC#' : 'USDOT#'} with FMCSA SAFER database...
                        </div>
                      )}
                      {carrierVerifyError && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{carrierVerifyError}</span>
                        </div>
                      )}
                      {carrierVerifySuccess && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{carrierVerifySuccess}</span>
                        </div>
                      )}

                      {/* Legal disclaimer */}
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                          <div className="text-[10px] leading-relaxed text-gray-500">
                            <p className="font-semibold text-gray-700 text-xs mb-1">Document Verification Notice</p>
                            <p>
                              Uploading falsified, forged, or fraudulent dispatch agreements or carrier
                              documents is a violation of federal law and may result in criminal prosecution
                              under 18 U.S.C. {'\u00A7'} 1001 and related statutes. DispatchLink and CarrierScout
                              Logistics reserve the right to report suspected fraud to the appropriate
                              authorities.
                            </p>
                            <p className="mt-1">
                              <strong>Disclaimer:</strong> DispatchLink, CarrierScout Logistics, and their affiliates
                              are not responsible for the authenticity of uploaded documents. Users are solely
                              responsible for ensuring all documents are legitimate and accurate. By uploading
                              a document, you certify that it is genuine and that you have authorization to share it.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">CarrierScout Subscription</label>
                        <p className="text-xs text-gray-400">Enables premium verification tier</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditCarrierScout(!editCarrierScout)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${editCarrierScout ? 'bg-[#10B981]' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editCarrierScout ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 btn-glossy-outline rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 btn-glossy-primary rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setPhotoModalOpen(false); setPhotoPreview(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Profile Picture</h2>
                <button onClick={() => { setPhotoModalOpen(false); setPhotoPreview(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Current photo preview */}
              <div className="flex justify-center mb-6">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden border-4 border-gray-100 shadow-lg">
                  {(photoPreview || currentUser.image) ? (
                    <img src={photoPreview || currentUser.image} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-5xl">{userInitial}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => profilePhotoRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 btn-glossy-primary rounded-xl transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Upload from Computer
                </button>

                {photoPreview && (
                  <button
                    onClick={handleSaveProfilePhoto}
                    className="w-full flex items-center justify-center gap-2 py-3 btn-glossy-emerald rounded-xl transition-all"
                  >
                    <Check className="w-5 h-5" />
                    Save Photo
                  </button>
                )}

                {currentUser.image && !photoPreview && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors text-sm"
                  >
                    Remove Current Photo
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Supports JPG, PNG, GIF, and WebP. Select any photo from your computer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cover Photo Modal */}
      {coverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setCoverModalOpen(false); setCoverPreview(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Cover Photo</h2>
                <button onClick={() => { setCoverModalOpen(false); setCoverPreview(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Cover preview — larger, no overlays */}
              <div className="w-full rounded-xl mb-4 overflow-hidden border border-gray-200 bg-gray-100" style={{ aspectRatio: '3/1' }}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : currentUser.coverImage?.startsWith('data:') || currentUser.coverImage?.startsWith('http') ? (
                  <img src={currentUser.coverImage} alt="Current cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: currentUser.coverImage || COVER_THEMES[0].gradient }} />
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => coverPhotoRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 btn-glossy-primary rounded-xl transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Upload from Computer
                </button>

                {coverPreview && (
                  <button
                    onClick={handleSaveCoverPhoto}
                    className="w-full flex items-center justify-center gap-2 py-3 btn-glossy-emerald rounded-xl transition-all"
                  >
                    <Check className="w-5 h-5" />
                    Save Cover Photo
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Use a landscape image for best results. Your photo will display at full quality with no filters or overlays. Supports JPG, PNG, and WebP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Frame Picker Modal */}
      {frameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFrameModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Choose Avatar Frame</h2>
                <button onClick={() => setFrameModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">Customize your profile picture with a decorative frame</p>

              {/* Frame preview */}
              <div className="flex justify-center mb-6">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden avatar-frame-${avatarFrame}`}>
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-4xl">{userInitial}</span>
                  )}
                </div>
              </div>

              {/* Frame options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'none', label: 'None', preview: 'border-4 border-white' },
                  { id: 'gold', label: 'Gold', preview: 'avatar-frame-gold' },
                  { id: 'rainbow', label: 'Rainbow', preview: 'avatar-frame-rainbow' },
                  { id: 'emerald', label: 'Emerald', preview: 'avatar-frame-emerald' },
                  { id: 'blue', label: 'Blue', preview: 'avatar-frame-blue' },
                  { id: 'purple', label: 'Purple', preview: 'avatar-frame-purple' },
                ].map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setAvatarFrame(frame.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      avatarFrame === frame.id ? 'border-[#3B82F6] bg-blue-50 ring-2 ring-[#3B82F6]/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden ${frame.preview}`}>
                      <span className="text-white font-bold text-lg">{userInitial}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{frame.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFrameModalOpen(false)}
                className="w-full py-3 btn-glossy-primary rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Picker Modal */}
      {themeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setThemeModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Profile Theme</h2>
                <button onClick={() => setThemeModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">Choose a cover gradient theme for your profile</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {COVER_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.gradient)}
                    className={`h-20 rounded-xl border-2 transition-all ${
                      selectedTheme === theme.gradient ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/30 scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ background: theme.gradient }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setThemeModalOpen(false)}
                  className="flex-1 py-3 btn-glossy-outline rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTheme}
                  className="flex-1 py-3 btn-glossy-primary rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Gallery Lightbox */}
      {galleryLightboxUrl && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
          onClick={() => setGalleryLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-10"
            onClick={() => setGalleryLightboxUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={galleryLightboxUrl}
            alt="Gallery photo"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default UserProfile;
