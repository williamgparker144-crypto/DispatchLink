// Type definitions for the DispatchLink Platform

export type UserType = 'dispatcher' | 'carrier' | 'broker' | 'advertiser';

export interface User {
  id: string;
  email: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  created_at: string;
}

export interface DispatcherProfile {
  id: string;
  user_id: string;
  subscription_tier: 'basic' | 'premier';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  years_experience: number;
  specialties: string[];
  bio: string;
  profile_image?: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  user?: User;
}

export interface CarrierProfile {
  id: string;
  user_id: string;
  dot_number: string;
  mc_number: string;
  authority_status: string;
  insurance_verified: boolean;
  insurance_expiry?: string;
  fleet_size: number;
  equipment_types: string[];
  operating_regions: string[];
  profile_image?: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  available_for_dispatch: boolean;
  user?: User;
}

export interface BrokerProfile {
  id: string;
  user_id: string;
  mc_number: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  specialties: string[];
  operating_regions: string[];
  profile_image?: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  years_in_business: number;
  user?: User;
}

export interface MCPermission {
  id: string;
  carrier_id: string;
  dispatcher_id: string;
  permission_type: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  status: 'active' | 'revoked' | 'expired';
  consent_signature?: string;
}

// Enriched MC permission with joined carrier profile data
export interface MCPermissionWithCarrier extends MCPermission {
  carrier?: {
    id: string;
    first_name: string;
    last_name: string;
    company_name: string;
    profile_image_url?: string;
    carrier_profiles?: {
      mc_number: string;
      dot_number: string;
      equipment_types: string[];
      operating_regions: string[];
    }[];
  };
}

// Demo load for the carrier-specific load search pipeline
export interface DemoLoad {
  id: string;
  origin: string;
  originState: string;
  destination: string;
  destinationState: string;
  distance: number;
  rate: number;
  ratePerMile: number;
  equipmentType: string;
  weight: string;
  pickupDate: string;
  deliveryDate: string;
  broker: string;
  commodity: string;
  status: 'available' | 'booked';
}

export interface IntentLead {
  id: string;
  source_platform: string;
  search_query: string;
  lead_type: 'dispatcher' | 'carrier';
  contact_email: string;
  contact_phone: string;
  company_name: string;
  engagement_score: number;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  assigned_to?: string;
  created_at: string;
}

export interface CarrierPacket {
  id: string;
  carrier_id: string;
  packet_type: string;
  w9_uploaded: boolean;
  insurance_cert_uploaded: boolean;
  authority_doc_uploaded: boolean;
  signed_agreement: boolean;
  agreement_signed_at?: string;
  status: 'pending' | 'complete' | 'expired';
}

export interface Subscription {
  id: string;
  dispatcher_id: string;
  plan: 'basic' | 'premier';
  price: number;
  billing_cycle: string;
  start_date: string;
  next_billing_date: string;
  status: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
  tier: 'basic' | 'premier';
}

// Social Features

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_company: string;
  author_type: UserType;
  author_image?: string;
  author_verified: boolean;
  content: string;
  post_type: 'update' | 'looking_for' | 'news' | 'milestone';
  likes_count: number;
  comments_count: number;
  liked_by_current_user: boolean;
  created_at: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_image?: string;
  document_url?: string;
  document_name?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_company: string;
  author_type: UserType;
  author_image?: string;
  content: string;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_company: string;
  requester_type: UserType;
  requester_image?: string;
  recipient_id: string;
  recipient_name: string;
  recipient_company: string;
  recipient_type: UserType;
  recipient_image?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_company: string;
  participant_type: UserType;
  participant_image?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

// Public Profile Viewing
export interface ViewableUser {
  id: string;
  name: string;
  company: string;
  userType: UserType;
  image?: string;
  verified: boolean;
  bio?: string;
  location?: string;
  website?: string;
  coverImage?: string;
  yearsExperience?: number;
  specialties?: string[];
  carriersWorkedWith?: { carrierName: string; mcNumber: string; verified: boolean }[];
  carrierScoutSubscribed?: boolean;
  verificationTier?: 'carrierscout_verified' | 'experience_verified' | 'beginner' | 'unverified';
}

// Advertising
export type AdFormat = 'feed_post' | 'directory_spotlight' | 'banner';
export type CampaignStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected';

export interface AdCampaign {
  id: string;
  advertiser_id: string;
  name: string;
  status: CampaignStatus;
  ad_format: AdFormat;
  target_user_types: string[];
  target_regions: string[];
  budget_notes?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  headline: string;
  body_text: string;
  image_url?: string;
  cta_text: string;
  cta_url?: string;
  created_at: string;
}

export interface SponsoredPost {
  type: 'sponsored';
  campaign: AdCampaign;
  creative: AdCreative;
  advertiserName: string;
  advertiserImage?: string;
}

// CarrierScout Invitation
export interface CarrierScoutInvite {
  id: string;
  dispatcher_id: string;
  carrier_name: string;
  carrier_mc_number: string;
  invite_email: string;
  invite_phone?: string;
  invite_method: 'email' | 'sms' | 'both';
  personal_message?: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  invited_at: string;
  accepted_at?: string;
  expires_at: string;
}
