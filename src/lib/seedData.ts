// Seed data module — only real registered users are stored via AppContext now

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  company: string;
  userType: 'dispatcher' | 'carrier' | 'broker';
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  yearsExperience?: number;
  specialties?: string[];
  carriersWorkedWith?: { carrierName: string; mcNumber: string; verified: boolean }[];
  carrierScoutSubscribed?: boolean;
  mcNumber?: string;
  dotNumber?: string;
}

export const seedCarriers: SeedUser[] = [];

export const seedDispatchers: SeedUser[] = [];

export const allSeedUsers: SeedUser[] = [];
