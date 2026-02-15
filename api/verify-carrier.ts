import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function — FMCSA SAFER carrier lookup.
 *
 * Scrapes the public SAFER Company Snapshot page to determine whether a
 * carrier with the given MC number exists and has active authority.
 *
 * GET /api/verify-carrier?mc=1777037
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET and POST
  const mc =
    (req.query.mc as string) ||
    (req.body as { mc?: string })?.mc;

  if (!mc) {
    return res.status(400).json({ error: 'MC number is required' });
  }

  // Strip "MC" prefix, dashes, spaces — keep only digits
  const cleanMC = mc.replace(/[^0-9]/g, '');

  if (!cleanMC || cleanMC.length < 4 || cleanMC.length > 8) {
    return res.status(400).json({ error: 'Invalid MC number format' });
  }

  try {
    // Try the FMCSA QC Mobile API first (if a webKey is configured)
    const webKey = process.env.FMCSA_API_KEY || '';
    if (webKey) {
      const apiResult = await tryQCMobileAPI(cleanMC, webKey);
      if (apiResult) {
        return res.status(200).json(apiResult);
      }
    }

    // Fallback: scrape SAFER Company Snapshot HTML
    const saferResult = await scrapeSAFER(cleanMC);
    return res.status(200).json(saferResult);
  } catch (err) {
    console.error('FMCSA verification error:', err);
    return res.status(500).json({
      found: false,
      active: false,
      legalName: '',
      mcNumber: `MC${cleanMC}`,
      dotNumber: '',
      error: 'Verification service temporarily unavailable',
    });
  }
}

// ── QC Mobile JSON API (requires webKey) ─────────────────────────────
async function tryQCMobileAPI(mc: string, webKey: string) {
  try {
    const url = `https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number/${mc}?webKey=${webKey}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return null;
    const json = await resp.json();
    const carrier = json?.content?.[0]?.carrier;
    if (!carrier) return null;
    return {
      found: true,
      active: carrier.statusCode === 'A',
      legalName: carrier.legalName || '',
      mcNumber: `MC${mc}`,
      dotNumber: String(carrier.dotNumber || ''),
      statusCode: carrier.statusCode || '',
      commonAuthorityStatus: carrier.commonAuthorityStatus || '',
    };
  } catch {
    return null;
  }
}

// ── SAFER HTML Scrape ─────────────────────────────────────────────────
async function scrapeSAFER(mc: string) {
  const url = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mc}`;
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: {
      'User-Agent': 'DispatchLink Carrier Verification/1.0',
    },
  });

  if (!resp.ok) {
    return {
      found: false,
      active: false,
      legalName: '',
      mcNumber: `MC${mc}`,
      dotNumber: '',
      error: 'SAFER lookup failed',
    };
  }

  const html = await resp.text();

  // Check if the page returned "no records found"
  if (
    html.includes('INVALID SEARCH') ||
    html.includes('no records matching') ||
    html.includes('0 records found') ||
    html.includes('could not be found')
  ) {
    return {
      found: false,
      active: false,
      legalName: '',
      mcNumber: `MC${mc}`,
      dotNumber: '',
    };
  }

  // Extract legal name — appears in a table cell after "Legal Name:"
  const legalName = extractField(html, 'Legal Name') || extractField(html, 'Entity Name') || '';

  // Extract DOT number
  const dotNumber = extractField(html, 'USDOT Number') || '';

  // Extract status — look for "ACTIVE" or "NOT AUTHORIZED" or "INACTIVE"
  const statusRaw = extractField(html, 'USDOT Status') || extractField(html, 'Operating Status') || '';
  const isActive = statusRaw.toUpperCase().includes('ACTIVE') && !statusRaw.toUpperCase().includes('NOT');

  // Check for authorized for property/passenger
  const hasAuthority = html.includes('AUTHORIZED FOR') || html.includes('authorized for');

  return {
    found: !!legalName,
    active: isActive && (hasAuthority || true), // Active USDOT is the primary check
    legalName,
    mcNumber: `MC${mc}`,
    dotNumber: dotNumber.replace(/[^0-9]/g, ''),
    statusCode: isActive ? 'A' : 'I',
  };
}

/**
 * Extract a field value from SAFER HTML.
 * SAFER uses label/value pairs in table cells.
 */
function extractField(html: string, label: string): string {
  // Pattern 1: <th>Label:</th><td>Value</td>  or similar table structures
  // SAFER uses various formats, try multiple patterns

  // Try: Label followed by a value in the next cell
  const patterns = [
    // <CENTER><B>Label :</B></CENTER></TH><TD ...><CENTER> VALUE </CENTER></TD>
    new RegExp(`${label}\\s*:?\\s*</[Bb]>\\s*</[Cc][Ee][Nn][Tt][Ee][Rr]>\\s*</[Tt][HhDd]>\\s*<[Tt][DdHh][^>]*>\\s*(?:<[Cc][Ee][Nn][Tt][Ee][Rr]>)?\\s*(?:<[AaBb][^>]*>)?\\s*([^<]+)`, 'i'),
    // simpler: Label : </...> <td> VALUE
    new RegExp(`${label}\\s*:?[^<]*<\\/[^>]+>\\s*<\\/[^>]+>\\s*<[Tt][Dd][^>]*>[^<]*<[^>]*>\\s*([^<]+)`, 'i'),
    // even simpler text search
    new RegExp(`${label}[:\\s]*<[^>]+>\\s*<[^>]+>\\s*<[^>]+>\\s*<[^>]+>\\s*([^<]+)`, 'i'),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return '';
}
