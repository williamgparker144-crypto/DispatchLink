import type { CurrentUser, CarrierReference } from '@/contexts/AppContext';

/**
 * Supabase DB row shape (joined users + profile table)
 */
// Profile shape from Supabase join
interface DispatcherProfileRow {
  years_experience?: number;
  specialties?: string[];
  carrier_scout_subscribed?: boolean;
  verified?: boolean;
}

interface CarrierProfileRow {
  dot_number?: string;
  mc_number?: string;
  authority_status?: string;
  equipment_types?: string[];
  verified?: boolean;
}

interface BrokerProfileRow {
  dot_number?: string;
  mc_number?: string;
  specialties?: string[];
  verified?: boolean;
}

interface AdvertiserProfileRow {
  business_name?: string;
  business_website?: string;
  industry?: string;
  contact_phone?: string;
  verified?: boolean;
}

// Supabase returns joined 1:1 relations as object (not array) due to UNIQUE FK
interface DbUser {
  id: string;
  email: string;
  user_type: 'dispatcher' | 'carrier' | 'broker' | 'advertiser';
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified?: boolean;
  dispatcher_profiles?: DispatcherProfileRow | DispatcherProfileRow[] | null;
  carrier_profiles?: CarrierProfileRow | CarrierProfileRow[] | null;
  broker_profiles?: BrokerProfileRow | BrokerProfileRow[] | null;
  advertiser_profiles?: AdvertiserProfileRow | AdvertiserProfileRow[] | null;
}

// Helper: Supabase returns object for unique FK joins, array for non-unique
function unwrapJoin<T>(val: T | T[] | null | undefined): T | undefined {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val[0];
  return val;
}

interface DbCarrierReference {
  carrier_name: string;
  mc_number: string;
  verified: boolean;
  agreement_file_url?: string;
  agreement_file_name?: string;
  agreement_uploaded_at?: string;
}

/**
 * Convert a Supabase DB row (with joined profile) into the app's CurrentUser shape.
 */
export function dbUserToCurrentUser(
  dbUser: DbUser,
  carrierRefs?: DbCarrierReference[]
): CurrentUser {
  const dispatcherProfile = unwrapJoin(dbUser.dispatcher_profiles);
  const carrierProfile = unwrapJoin(dbUser.carrier_profiles);
  const brokerProfile = unwrapJoin(dbUser.broker_profiles);
  const advertiserProfile = unwrapJoin(dbUser.advertiser_profiles);

  const carriersWorkedWith: CarrierReference[] | undefined = carrierRefs?.map(ref => ({
    carrierName: ref.carrier_name,
    mcNumber: ref.mc_number,
    verified: ref.verified,
    agreementFileName: ref.agreement_file_name,
    agreementUploadedAt: ref.agreement_uploaded_at,
  }));

  return {
    id: dbUser.id,
    name: `${dbUser.first_name} ${dbUser.last_name}`,
    email: dbUser.email,
    company: dbUser.company_name || '',
    userType: dbUser.user_type,
    image: dbUser.profile_image_url,
    coverImage: dbUser.cover_image_url,
    bio: dbUser.bio,
    location: dbUser.location,
    website: dbUser.website,
    verified: dbUser.verified ?? false,
    // Dispatcher-specific
    yearsExperience: dispatcherProfile?.years_experience,
    specialties: dispatcherProfile?.specialties,
    carrierScoutSubscribed: dispatcherProfile?.carrier_scout_subscribed,
    carriersWorkedWith,
    // Carrier-specific
    mcNumber: carrierProfile?.mc_number || brokerProfile?.mc_number,
    dotNumber: carrierProfile?.dot_number || brokerProfile?.dot_number,
    // Advertiser-specific
    businessName: advertiserProfile?.business_name,
    businessWebsite: advertiserProfile?.business_website,
    industry: advertiserProfile?.industry,
  };
}

/**
 * Convert partial CurrentUser updates into DB field objects for upsert.
 */
export function currentUserToDbFields(updates: Partial<CurrentUser>): {
  userFields: Record<string, unknown>;
  dispatcherFields: Record<string, unknown>;
  advertiserFields: Record<string, unknown>;
} {
  const userFields: Record<string, unknown> = {};
  const dispatcherFields: Record<string, unknown> = {};
  const advertiserFields: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    const parts = updates.name.split(' ');
    userFields.first_name = parts[0] || '';
    userFields.last_name = parts.slice(1).join(' ') || '';
  }
  if (updates.company !== undefined) userFields.company_name = updates.company;
  if (updates.bio !== undefined) userFields.bio = updates.bio;
  if (updates.location !== undefined) userFields.location = updates.location;
  if (updates.website !== undefined) userFields.website = updates.website;
  if (updates.image !== undefined) userFields.profile_image_url = updates.image;
  if (updates.coverImage !== undefined) userFields.cover_image_url = updates.coverImage;

  if (updates.yearsExperience !== undefined) dispatcherFields.years_experience = updates.yearsExperience;
  if (updates.specialties !== undefined) dispatcherFields.specialties = updates.specialties;
  if (updates.carrierScoutSubscribed !== undefined) dispatcherFields.carrier_scout_subscribed = updates.carrierScoutSubscribed;

  if (updates.businessName !== undefined) advertiserFields.business_name = updates.businessName;
  if (updates.businessWebsite !== undefined) advertiserFields.business_website = updates.businessWebsite;
  if (updates.industry !== undefined) advertiserFields.industry = updates.industry;

  return { userFields, dispatcherFields, advertiserFields };
}
