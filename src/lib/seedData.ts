// Seed dispatchers and carriers so the directory is never empty on first load

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

// Two seed carriers (for cross-referencing)
export const seedCarriers: SeedUser[] = [
  {
    id: 'seed-carrier-1',
    name: 'Mike Reynolds',
    email: 'mike@reynoldsfreight.com',
    company: 'Reynolds Freight LLC',
    userType: 'carrier',
    bio: 'OTR and regional flatbed carrier operating across the Midwest and Southeast.',
    location: 'Nashville, TN',
    verified: true,
    mcNumber: 'MC892451',
    dotNumber: 'DOT3456789',
  },
  {
    id: 'seed-carrier-2',
    name: 'Linda Chen',
    email: 'linda@pacifichaul.com',
    company: 'Pacific Haul Transport',
    userType: 'carrier',
    bio: 'West coast reefer and dry van carrier specializing in produce and grocery logistics.',
    location: 'Fresno, CA',
    verified: true,
    mcNumber: 'MC761234',
    dotNumber: 'DOT2345678',
  },
];

// Six seed dispatchers with varying experience levels
export const seedDispatchers: SeedUser[] = [
  // Fully verified (CarrierScout + carrier references + 5+ years)
  {
    id: 'seed-disp-1',
    name: 'Marcus Johnson',
    email: 'marcus@elitedispatch.com',
    company: 'Elite Dispatch Solutions',
    userType: 'dispatcher',
    bio: 'Veteran dispatcher with 8+ years managing flatbed and heavy haul across 48 states. CarrierScout certified with a network of 200+ carriers.',
    location: 'Dallas, TX',
    verified: true,
    yearsExperience: 8,
    specialties: ['Flatbed', 'Heavy Haul', 'Hazmat'],
    carriersWorkedWith: [
      { carrierName: 'Reynolds Freight LLC', mcNumber: 'MC892451', verified: true },
      { carrierName: 'Lone Star Trucking', mcNumber: 'MC554321', verified: false },
    ],
    carrierScoutSubscribed: true,
  },
  {
    id: 'seed-disp-2',
    name: 'Sarah Williams',
    email: 'sarah@swiftlogistics.com',
    company: 'Swift Lane Logistics',
    userType: 'dispatcher',
    bio: 'Full-service dispatching for reefer and dry van operators. Specializing in west coast produce lanes and backhaul optimization.',
    location: 'Los Angeles, CA',
    verified: true,
    yearsExperience: 6,
    specialties: ['Reefer', 'Dry Van', 'LTL'],
    carriersWorkedWith: [
      { carrierName: 'Pacific Haul Transport', mcNumber: 'MC761234', verified: true },
      { carrierName: 'Valley Fresh Carriers', mcNumber: 'MC443322', verified: false },
    ],
    carrierScoutSubscribed: true,
  },
  // Intermediate (2-5 years, some references)
  {
    id: 'seed-disp-3',
    name: 'David Martinez',
    email: 'david@truckconnect.io',
    company: 'TruckConnect Dispatch',
    userType: 'dispatcher',
    bio: 'Growing dispatch operation focused on owner-operators. Experienced in dry van and reefer lanes throughout the Southeast.',
    location: 'Atlanta, GA',
    verified: false,
    yearsExperience: 3,
    specialties: ['Dry Van', 'Reefer', 'Expedited'],
    carriersWorkedWith: [
      { carrierName: 'Southern Express', mcNumber: 'MC332211', verified: false },
    ],
    carrierScoutSubscribed: false,
  },
  {
    id: 'seed-disp-4',
    name: 'Ashley Thompson',
    email: 'ashley@routemaster.com',
    company: 'RouteMaster Dispatching',
    userType: 'dispatcher',
    bio: 'Dispatcher with strong broker relationships and expertise in tanker and hazmat freight. Always looking for quality carriers to add to my roster.',
    location: 'Houston, TX',
    verified: false,
    yearsExperience: 4,
    specialties: ['Tanker', 'Hazmat', 'Flatbed'],
    carriersWorkedWith: [
      { carrierName: 'Gulf Coast Transport', mcNumber: 'MC665544', verified: false },
      { carrierName: 'Reynolds Freight LLC', mcNumber: 'MC892451', verified: true },
    ],
    carrierScoutSubscribed: false,
  },
  // Beginners (0-1 years, no references)
  {
    id: 'seed-disp-5',
    name: 'Jordan Lee',
    email: 'jordan@newwavedispatch.com',
    company: 'New Wave Dispatch',
    userType: 'dispatcher',
    bio: 'Newly licensed dispatcher eager to build relationships with carriers. Recently completed dispatch training and ready to prove myself.',
    location: 'Chicago, IL',
    verified: false,
    yearsExperience: 0,
    specialties: ['Dry Van', 'Reefer'],
    carriersWorkedWith: [],
    carrierScoutSubscribed: false,
  },
  {
    id: 'seed-disp-6',
    name: 'Priya Patel',
    email: 'priya@nextsteplogistics.com',
    company: 'NextStep Logistics',
    userType: 'dispatcher',
    bio: 'Starting my dispatch career with a focus on auto transport. Background in logistics coordination and supply chain management.',
    location: 'Phoenix, AZ',
    verified: false,
    yearsExperience: 1,
    specialties: ['Auto Transport', 'LTL'],
    carriersWorkedWith: [],
    carrierScoutSubscribed: false,
  },
];

export const allSeedUsers: SeedUser[] = [...seedCarriers, ...seedDispatchers];
