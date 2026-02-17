/**
 * FMCSA carrier verification — client side.
 *
 * 1. Calls our own /api/verify-carrier serverless function which scrapes
 *    the FMCSA SAFER database server-side (no CORS issues).
 * 2. If the serverless function is unreachable (local dev, network error)
 *    falls back to a local demo lookup for known seed-data carriers.
 * 3. For any MC# not recognised by either path the result is
 *    { found: false } — the caller decides how to handle it.
 */

export interface FMCSACarrierResult {
  found: boolean;
  active: boolean;
  legalName: string;
  mcNumber: string;
  dotNumber: string;
  statusCode: string;
  /** When true the result came from the live FMCSA database */
  liveVerified?: boolean;
  error?: string;
}

// ── 1. Server-side lookup via our Vercel function ────────────────────
async function fetchFromServer(mc: string): Promise<FMCSACarrierResult | null> {
  try {
    const cleanMC = mc.replace(/[^0-9]/g, '');
    const res = await fetch(`/api/verify-carrier?mc=${encodeURIComponent(cleanMC)}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error && !data.found) return null;
    return { ...data, liveVerified: true };
  } catch {
    return null;
  }
}

async function fetchFromServerByDOT(dot: string): Promise<FMCSACarrierResult | null> {
  try {
    const cleanDOT = dot.replace(/[^0-9]/g, '');
    const res = await fetch(`/api/verify-carrier?dot=${encodeURIComponent(cleanDOT)}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error && !data.found) return null;
    return { ...data, liveVerified: true };
  } catch {
    return null;
  }
}

// ── 2. Local demo fallback (seed-data carriers only) ─────────────────
const KNOWN_DEMO_CARRIERS: Record<string, { legalName: string; dot: string }> = {
  'MC892451':  { legalName: 'Reynolds Freight LLC',         dot: '1234567' },
  'MC761234':  { legalName: 'Pacific Haul Transport',       dot: '1122334' },
  'MC554321':  { legalName: 'Lone Star Trucking',          dot: '2233445' },
  'MC443322':  { legalName: 'Valley Fresh Carriers',       dot: '3344556' },
  'MC332211':  { legalName: 'Southern Express',            dot: '4455667' },
  'MC665544':  { legalName: 'Gulf Coast Transport',        dot: '5566778' },
  'MC734219':  { legalName: 'Heartland Express',           dot: '2345678' },
  'MC615832':  { legalName: 'Werner Enterprises',          dot: '3456789' },
  'MC921047':  { legalName: 'J.B. Hunt Transport',         dot: '4567890' },
  'MC487263':  { legalName: 'Schneider National',          dot: '5678901' },
  'MC156789':  { legalName: 'XPO Logistics',               dot: '6789012' },
  'MC823516':  { legalName: 'Landstar System',             dot: '7890123' },
  'MC209374':  { legalName: 'Old Dominion Freight Line',   dot: '8901234' },
  'MC378461':  { legalName: 'Knight-Swift Transportation', dot: '9012345' },
  'MC987654':  { legalName: 'Verified Carrier LLC',        dot: '2233541' },
};

function demoLookup(mc: string): FMCSACarrierResult | null {
  const upper = mc.toUpperCase().replace(/^MC-?/i, 'MC');
  const normalized = upper.startsWith('MC') ? upper : `MC${upper}`;
  const match = KNOWN_DEMO_CARRIERS[normalized];
  if (match) {
    return {
      found: true,
      active: true,
      legalName: match.legalName,
      mcNumber: normalized,
      dotNumber: match.dot,
      statusCode: 'A',
      liveVerified: false,
    };
  }
  // Not in demo list — return null so caller knows we couldn't verify
  return null;
}

// ── Exported entry points ────────────────────────────────────────────
export async function verifyCarrierMC(mcNumber: string): Promise<FMCSACarrierResult> {
  // Try live verification via our serverless function
  const live = await fetchFromServer(mcNumber);
  if (live) return live;

  // Try demo lookup for seed-data carriers
  const demo = demoLookup(mcNumber);
  if (demo) return demo;

  // Neither source could verify — return "unable to verify" (NOT "rejected")
  const cleanMC = mcNumber.replace(/[^0-9]/g, '');
  const normalized = cleanMC ? `MC${cleanMC}` : mcNumber.toUpperCase();
  return {
    found: false,
    active: false,
    legalName: '',
    mcNumber: normalized,
    dotNumber: '',
    statusCode: '',
    liveVerified: false,
    error: 'unable_to_verify',
  };
}

export async function verifyCarrierDOT(dotNumber: string): Promise<FMCSACarrierResult> {
  const live = await fetchFromServerByDOT(dotNumber);
  if (live) return live;

  const cleanDOT = dotNumber.replace(/[^0-9]/g, '');
  return {
    found: false,
    active: false,
    legalName: '',
    mcNumber: '',
    dotNumber: cleanDOT ? `DOT${cleanDOT}` : dotNumber.toUpperCase(),
    statusCode: '',
    liveVerified: false,
    error: 'unable_to_verify',
  };
}
