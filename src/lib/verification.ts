// Verification tier computation for dispatchers

export type VerificationTier = 'carrierscout_verified' | 'experience_verified' | 'beginner' | 'unverified';

interface CarrierRef {
  carrierName: string;
  mcNumber: string;
  verified: boolean;
}

interface VerifiableUser {
  yearsExperience?: number;
  carriersWorkedWith?: CarrierRef[];
  carrierScoutSubscribed?: boolean;
}

export function computeVerificationTier(user: VerifiableUser): VerificationTier {
  const years = user.yearsExperience ?? 0;
  const carriers = user.carriersWorkedWith ?? [];
  const hasVerifiedCarrier = carriers.some(c => c.verified);
  const hasAnyCarrier = carriers.length > 0;

  if (user.carrierScoutSubscribed && hasVerifiedCarrier) {
    return 'carrierscout_verified';
  }
  if (years >= 2 && hasAnyCarrier) {
    return 'experience_verified';
  }
  if (years <= 1) {
    return 'beginner';
  }
  return 'unverified';
}

export function getVerificationBadgeInfo(tier: VerificationTier): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (tier) {
    case 'carrierscout_verified':
      return {
        label: 'CarrierScout Verified',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
      };
    case 'experience_verified':
      return {
        label: 'Experience Verified',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
      };
    case 'beginner':
      return {
        label: 'New Dispatcher',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
      };
    case 'unverified':
      return {
        label: 'Unverified',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200',
      };
  }
}

/**
 * Cross-reference a dispatcher's claimed carriers against registered carrier users.
 * A carrier reference is "verified" if a carrier with matching MC# exists in the registry.
 */
export function crossReferenceCarriers(
  carrierRefs: CarrierRef[],
  registeredCarrierMCs: Set<string>
): CarrierRef[] {
  return carrierRefs.map(ref => ({
    ...ref,
    verified: registeredCarrierMCs.has(ref.mcNumber.toUpperCase()),
  }));
}
