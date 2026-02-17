import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function — FMCSA SAFER carrier lookup.
 *
 * Scrapes the public SAFER Company Snapshot page to retrieve comprehensive
 * carrier data including legal name, authority, fleet size, inspections, etc.
 *
 * GET /api/verify-carrier?mc=1777037
 * GET /api/verify-carrier?dot=4494266
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const mc = (req.query.mc as string) || (req.body as { mc?: string })?.mc;
  const dot = (req.query.dot as string) || (req.body as { dot?: string })?.dot;

  if (!mc && !dot) {
    return res.status(400).json({ error: 'MC or DOT number is required' });
  }

  const cleanMC = mc ? mc.replace(/[^0-9]/g, '') : '';
  const cleanDOT = dot ? dot.replace(/[^0-9]/g, '') : '';

  if (cleanMC && (cleanMC.length < 4 || cleanMC.length > 8)) {
    return res.status(400).json({ error: 'Invalid MC number format' });
  }
  if (cleanDOT && (cleanDOT.length < 5 || cleanDOT.length > 9)) {
    return res.status(400).json({ error: 'Invalid DOT number format' });
  }

  try {
    const result = await scrapeSAFER(cleanMC, cleanDOT);
    return res.status(200).json(result);
  } catch (err) {
    console.error('FMCSA verification error:', err);
    return res.status(500).json({
      found: false,
      active: false,
      legalName: '',
      mcNumber: cleanMC ? `MC${cleanMC}` : '',
      dotNumber: cleanDOT || '',
      error: 'Verification service temporarily unavailable',
    });
  }
}

// ── SAFER HTML Scrape ─────────────────────────────────────────────────
async function scrapeSAFER(mc: string, dot: string) {
  // Build URL — prefer DOT lookup (more reliable), fall back to MC
  let url: string;
  if (dot) {
    url = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${dot}`;
  } else {
    url = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mc}`;
  }

  const resp = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: {
      'User-Agent': 'DispatchLink Carrier Verification/1.0',
    },
  });

  if (!resp.ok) {
    return {
      found: false,
      active: false,
      legalName: '',
      mcNumber: mc ? `MC${mc}` : '',
      dotNumber: dot || '',
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
      mcNumber: mc ? `MC${mc}` : '',
      dotNumber: dot || '',
    };
  }

  // ── Extract fields from SAFER HTML ──────────────────────────────────

  const legalName = extractAfterLabel(html, 'Legal Name') || '';
  const dbaName = extractAfterLabel(html, 'DBA Name') || '';
  const dotNumber = extractAfterLabel(html, 'USDOT Number') || dot || '';
  const phone = extractAfterLabel(html, 'Phone') || '';

  // USDOT Status
  const statusRaw = extractAfterLabel(html, 'USDOT Status') || '';
  const isActive = statusRaw.toUpperCase().includes('ACTIVE') && !statusRaw.toUpperCase().includes('INACTIVE');

  // Out of Service Date
  const oosDateRaw = extractAfterLabel(html, 'Out of Service Date') || '';
  const oosDate = oosDateRaw.toLowerCase().includes('none') ? '' : oosDateRaw.trim();

  // MC Number — extract from anchor tag like MC-1777037
  let mcNumber = mc ? `MC${mc}` : '';
  const mcMatch = html.match(/MC-(\d{4,8})/);
  if (mcMatch) {
    mcNumber = `MC${mcMatch[1]}`;
  }

  // Power Units
  const powerUnitsRaw = extractAfterLabel(html, 'Power Units') || '0';
  const totalPowerUnits = parseInt(powerUnitsRaw.replace(/[^0-9]/g, ''), 10) || 0;

  // Drivers — in a nested table after "Drivers:" label
  const driversMatch = html.match(/Drivers:<\/A><\/TH>\s*<TD[^>]*>(?:<FONT[^>]*><B>)?\s*(\d+)/i);
  const totalDrivers = driversMatch ? parseInt(driversMatch[1], 10) || 0 : 0;

  // Physical Address
  const physAddr = extractAddress(html, 'physicaladdressvalue');
  // Mailing Address
  const mailAddr = extractAddress(html, 'mailingaddressvalue');

  // Operating Authority Status
  const authStatusRaw = extractAfterLabel(html, 'Operating Authority Status') || '';
  const hasAuthority = authStatusRaw.toUpperCase().includes('AUTHORIZED FOR');
  const commonAuthorityStatus = hasAuthority ? 'A' : 'N';

  // Carrier Operation — check which boxes are marked with X
  const carrierOps: string[] = [];
  const opsSection = html.match(/Carrier Operation:[\s\S]*?(?=Cargo Carried:|Shipper Operation:|$)/i);
  if (opsSection) {
    if (/X<\/TD>\s*<TD>.*?Interstate/i.test(opsSection[0])) carrierOps.push('Interstate');
    if (/X<\/TD>\s*<TD>.*?Intrastate Only \(HM\)/i.test(opsSection[0])) carrierOps.push('Intrastate HM');
    if (/X<\/TD>\s*<TD>.*?Intrastate Only \(Non-HM\)/i.test(opsSection[0])) carrierOps.push('Intrastate Non-HM');
  }
  const carrierOperation = carrierOps.join(', ') || '';

  // Operation Classification
  const opClassifications: string[] = [];
  const classSection = html.match(/Operation Classification:[\s\S]*?(?=Carrier Operation:|$)/i);
  if (classSection) {
    if (/X<\/TD>\s*<TD>.*?Auth\. For Hire/i.test(classSection[0])) opClassifications.push('Auth. For Hire');
    if (/X<\/TD>\s*<TD>.*?Exempt For Hire/i.test(classSection[0])) opClassifications.push('Exempt For Hire');
    if (/X<\/TD>\s*<TD>.*?Private\(Property\)/i.test(classSection[0])) opClassifications.push('Private (Property)');
  }

  // Cargo Carried
  const cargoTypes: string[] = [];
  const cargoSection = html.match(/Cargo Carried:[\s\S]*?<\/TABLE>\s*<\/TD>\s*<\/TR>\s*<\/TABLE>/i);
  if (cargoSection) {
    const cargoItems = cargoSection[0].matchAll(/X<\/TD>\s*<TD><FONT[^>]*>([^<]+)/gi);
    for (const item of cargoItems) {
      cargoTypes.push(item[1].trim());
    }
  }

  // ── Inspection Data ─────────────────────────────────────────────────
  // Inspection table: Vehicle / Driver / Hazmat / IEP columns
  const inspTable = html.match(/Inspection Type[\s\S]*?<\/TABLE>/i);
  let vehicleInsp = 0, vehicleOosInsp = 0, vehicleOosRate = 0;
  let driverInsp = 0, driverOosInsp = 0, driverOosRate = 0;
  let hazmatInsp = 0, hazmatOosInsp = 0, hazmatOosRate = 0;

  if (inspTable) {
    const rows = inspTable[0].match(/<TR>[\s\S]*?<\/TR>/gi) || [];
    for (const row of rows) {
      const cells = row.match(/<TD[^>]*class="queryfield"[^>]*>\s*([^<]*)/gi) || [];
      const values = cells.map(c => {
        const m = c.match(/>([^<]*)/);
        return m ? m[1].trim().replace('%', '') : '0';
      });

      if (row.includes('>Inspections<')) {
        vehicleInsp = parseInt(values[0], 10) || 0;
        driverInsp = parseInt(values[1], 10) || 0;
        hazmatInsp = parseInt(values[2], 10) || 0;
      } else if (row.includes('>Out of Service<') && !row.includes('%')) {
        vehicleOosInsp = parseInt(values[0], 10) || 0;
        driverOosInsp = parseInt(values[1], 10) || 0;
        hazmatOosInsp = parseInt(values[2], 10) || 0;
      } else if (row.includes('Out of Service %')) {
        vehicleOosRate = parseFloat(values[0]) || 0;
        driverOosRate = parseFloat(values[1]) || 0;
        hazmatOosRate = parseFloat(values[2]) || 0;
      }
    }
  }

  // ── Crash Data ──────────────────────────────────────────────────────
  const crashTable = html.match(/Crashes:<\/A>[\s\S]*?<\/TABLE>/i);
  let fatalCrash = 0, injCrash = 0, towCrash = 0, crashTotal = 0;

  if (crashTable) {
    const crashRows = crashTable[0].match(/<TR>[\s\S]*?<\/TR>/gi) || [];
    for (const row of crashRows) {
      if (row.includes('>Crashes<') && row.includes('queryfield')) {
        const cells = row.match(/<TD[^>]*class="queryfield"[^>]*>\s*([^<]*)/gi) || [];
        const values = cells.map(c => {
          const m = c.match(/>([^<]*)/);
          return m ? parseInt(m[1].trim(), 10) || 0 : 0;
        });
        if (values.length >= 4) {
          fatalCrash = values[0];
          injCrash = values[1];
          towCrash = values[2];
          crashTotal = values[3];
        }
      }
    }
  }

  // ── Safety Rating ──────────────────────────────────────────────────
  const safetyRating = extractAfterLabel(html, 'Safety Rating') || '';
  const safetyRatingDate = extractAfterLabel(html, 'Rating Date') || '';
  const safetyReviewDate = extractAfterLabel(html, 'Review Date') || '';
  const safetyReviewType = extractAfterLabel(html, 'Review Type') || '';

  return {
    found: !!legalName,
    active: isActive,
    legalName: cleanText(legalName),
    dbaName: cleanText(dbaName),
    mcNumber,
    dotNumber: dotNumber.replace(/[^0-9]/g, ''),
    statusCode: isActive ? 'A' : 'I',
    oosDate,
    phone: cleanText(phone),
    physicalAddress: physAddr,
    mailingAddress: mailAddr,
    carrierOperation,
    operationClassification: opClassifications.join(', '),
    cargoCarried: cargoTypes,
    commonAuthorityStatus,
    operatingAuthorityStatus: cleanText(authStatusRaw),
    totalPowerUnits,
    totalDrivers,
    vehicleInsp,
    vehicleOosInsp,
    vehicleOosRate,
    driverInsp,
    driverOosInsp,
    driverOosRate,
    hazmatInsp,
    hazmatOosInsp,
    hazmatOosRate,
    crashTotal,
    fatalCrash,
    injCrash,
    towCrash,
    safetyRating: cleanText(safetyRating),
    safetyRatingDate: cleanText(safetyRatingDate),
    safetyReviewDate: cleanText(safetyReviewDate),
    safetyReviewType: cleanText(safetyReviewType),
  };
}

/**
 * Extract the value from the TD cell that follows a TH containing the given label.
 * Handles SAFER's pattern: <TH ...><A ...>Label:</A></TH> <TD class="queryfield" ...>VALUE</TD>
 */
function extractAfterLabel(html: string, label: string): string {
  // Pattern: label text in a TH/A, followed by </A></TH>, then <TD ...>VALUE
  const patterns = [
    // Standard SAFER: ...Label:</A></TH>\n<TD class="queryfield" ...>VALUE&nbsp;</TD>
    new RegExp(`${label}\\s*:?</[Aa]>\\s*</[Tt][Hh]>\\s*<[Tt][Dd][^>]*>\\s*([\\s\\S]*?)\\s*</[Tt][Dd]>`, 'i'),
    // Sometimes without the anchor: Label:</TH><TD ...>VALUE</TD>
    new RegExp(`${label}\\s*:?\\s*</[Tt][Hh]>\\s*<[Tt][Dd][^>]*>\\s*([\\s\\S]*?)\\s*</[Tt][Dd]>`, 'i'),
    // Broader: anything with the label followed by a queryfield TD
    new RegExp(`${label}[^<]*<[^>]*>\\s*<[Tt][Dd][^>]*class="queryfield"[^>]*>\\s*([\\s\\S]*?)\\s*</[Tt][Dd]>`, 'i'),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match?.[1]) {
      // Strip HTML tags and decode entities
      const raw = match[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (raw && raw !== '--') return raw;
    }
  }

  return '';
}

/**
 * Extract a structured address from SAFER HTML by TD id attribute.
 */
function extractAddress(html: string, tdId: string): { street: string; city: string; state: string; zip: string } {
  const regex = new RegExp(`id="${tdId}"[^>]*>\\s*([\\s\\S]*?)\\s*</[Tt][Dd]>`, 'i');
  const match = html.match(regex);
  if (!match?.[1]) return { street: '', city: '', state: '', zip: '' };

  const raw = match[1].replace(/&nbsp;/g, ' ').trim();
  // Address is formatted as: STREET<br>CITY, STATE ZIP
  const parts = raw.split(/<br\s*\/?>/i);
  const street = (parts[0] || '').replace(/<[^>]+>/g, '').trim();
  const cityLine = (parts[1] || '').replace(/<[^>]+>/g, '').trim();

  // Parse "CITY, STATE  ZIP"
  const cityMatch = cityLine.match(/^([^,]+),\s*(\w{2})\s+(\d{5}(?:-\d{4})?)/);
  if (cityMatch) {
    return { street, city: cityMatch[1].trim(), state: cityMatch[2], zip: cityMatch[3] };
  }

  return { street, city: cityLine, state: '', zip: '' };
}

/**
 * Clean extracted text — remove HTML artifacts, extra whitespace.
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
