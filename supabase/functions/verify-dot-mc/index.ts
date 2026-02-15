// Supabase Edge Function: verify-dot-mc
// Fetches carrier data from FMCSA SAFER public HTML and parses it into CarrierData

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CarrierData {
  dotNumber: string;
  legalName: string;
  dbaName: string;
  carrierOperation: string;
  hqAddress: AddressData;
  mailingAddress: AddressData;
  phone: string;
  fax: string;
  email: string;
  mcNumber: string;
  mxNumber: string;
  statusCode: string;
  commonAuthorityStatus: string;
  contractAuthorityStatus: string;
  brokerAuthorityStatus: string;
  bondInsuranceOnFile: string;
  bondInsuranceRequired: string;
  bipdInsuranceOnFile: string;
  bipdInsuranceRequired: string;
  cargoInsuranceOnFile: string;
  cargoInsuranceRequired: string;
  safetyRating: string;
  safetyRatingDate: string;
  safetyReviewDate: string;
  safetyReviewType: string;
  oosDate: string;
  totalDrivers: number;
  totalPowerUnits: number;
  driverInsp: number;
  driverOosInsp: number;
  driverOosRate: number;
  vehicleInsp: number;
  vehicleOosInsp: number;
  vehicleOosRate: number;
  hazmatInsp: number;
  hazmatOosInsp: number;
  hazmatOosRate: number;
  crashTotal: number;
  fatalCrash: number;
  injCrash: number;
  towCrash: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

function extractFieldAfterLabel(html: string, labelPattern: string): string {
  // Match: label in a <th> or <td> followed by a value in a <td>
  const patterns = [
    new RegExp(`<th[^>]*>[^<]*${labelPattern}[^<]*</th>\\s*<td[^>]*>([^<]*(?:<[^/][^>]*>[^<]*)*)</td>`, 'is'),
    new RegExp(`<td[^>]*>[^<]*${labelPattern}[^<]*</td>\\s*<td[^>]*>([^<]*(?:<[^/][^>]*>[^<]*)*)</td>`, 'is'),
    new RegExp(`>${labelPattern}\\s*:?\\s*</(?:th|td)>\\s*<td[^>]*>\\s*([^<]+)`, 'is'),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1]) {
      return stripHtml(match[1]);
    }
  }
  return '';
}

function extractNumber(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function parseFloat2(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return cleaned ? parseFloat(cleaned) : 0;
}

function parseAddress(block: string): AddressData {
  // Try to parse address lines from a block of text
  const lines = block.split(/\n|<br\s*\/?>|<BR\s*\/?>/).map(l => stripHtml(l)).filter(Boolean);

  if (lines.length >= 2) {
    const street = lines[0] || '';
    // Last line usually has "CITY, STATE ZIP COUNTRY" or "CITY, STATE ZIP"
    const lastLine = lines[lines.length - 1];
    const cityStateZip = lastLine.match(/^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*(.*)?$/i);

    if (cityStateZip) {
      return {
        street,
        city: cityStateZip[1].trim(),
        state: cityStateZip[2].trim(),
        zipCode: cityStateZip[3].trim(),
        country: cityStateZip[4]?.trim() || 'US',
      };
    }

    return { street, city: '', state: '', zipCode: '', country: 'US' };
  }

  return { street: '', city: '', state: '', zipCode: '', country: '' };
}

function parseAddressFromHtml(html: string, labelPattern: string): AddressData {
  // Look for the address block after the label
  const patterns = [
    new RegExp(`${labelPattern}[^<]*</(?:th|td)>\\s*<td[^>]*>(.*?)</td>`, 'is'),
    new RegExp(`${labelPattern}[\\s\\S]*?<td[^>]*>(.*?)</td>`, 'is'),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1]) {
      return parseAddress(match[1]);
    }
  }

  return { street: '', city: '', state: '', zipCode: '', country: '' };
}

function parseInspectionTable(html: string): {
  driverInsp: number; driverOosInsp: number; driverOosRate: number;
  vehicleInsp: number; vehicleOosInsp: number; vehicleOosRate: number;
  hazmatInsp: number; hazmatOosInsp: number; hazmatOosRate: number;
} {
  const result = {
    driverInsp: 0, driverOosInsp: 0, driverOosRate: 0,
    vehicleInsp: 0, vehicleOosInsp: 0, vehicleOosRate: 0,
    hazmatInsp: 0, hazmatOosInsp: 0, hazmatOosRate: 0,
  };

  // Look for the inspections table - usually contains rows with Driver, Vehicle, Hazmat
  // Pattern: rows have inspection count, OOS count, national average, OOS rate
  const inspectionSection = html.match(/Inspections\/Investigations[\s\S]*?(?=Crashes|$)/i);
  if (!inspectionSection) return result;

  const section = inspectionSection[0];

  // Extract rows of numbers - the table typically has 3 data rows (Driver, Vehicle, Hazmat)
  // Each row: Inspections | OOS | Nat'l Avg | OOS %
  const numberRows = section.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

  // Find rows that contain numeric data (not header rows)
  const dataRows: string[][] = [];
  for (const row of numberRows) {
    const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
      .map(cell => stripHtml(cell));
    // A data row should have mostly numeric content
    const numericCells = cells.filter(c => /^\d/.test(c) || c === '0');
    if (numericCells.length >= 2) {
      dataRows.push(cells);
    }
  }

  // Try to map the rows - typically Driver, Vehicle, Hazmat order
  if (dataRows.length >= 1) {
    const d = dataRows[0];
    result.driverInsp = extractNumber(d[0] || '0');
    result.driverOosInsp = extractNumber(d[1] || '0');
    result.driverOosRate = parseFloat2(d[d.length - 1] || '0');
  }
  if (dataRows.length >= 2) {
    const v = dataRows[1];
    result.vehicleInsp = extractNumber(v[0] || '0');
    result.vehicleOosInsp = extractNumber(v[1] || '0');
    result.vehicleOosRate = parseFloat2(v[v.length - 1] || '0');
  }
  if (dataRows.length >= 3) {
    const h = dataRows[2];
    result.hazmatInsp = extractNumber(h[0] || '0');
    result.hazmatOosInsp = extractNumber(h[1] || '0');
    result.hazmatOosRate = parseFloat2(h[h.length - 1] || '0');
  }

  return result;
}

function parseCrashTable(html: string): {
  crashTotal: number; fatalCrash: number; injCrash: number; towCrash: number;
} {
  const result = { crashTotal: 0, fatalCrash: 0, injCrash: 0, towCrash: 0 };

  const crashSection = html.match(/Crash(?:es)?[\s\S]*?(?=<\/table>)/i);
  if (!crashSection) return result;

  const section = crashSection[0];

  // Look for crash data row with Fatal, Injury, Tow, Total
  const numberRows = section.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of numberRows) {
    const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
      .map(cell => stripHtml(cell));
    const numericCells = cells.filter(c => /^\d/.test(c));
    if (numericCells.length >= 3) {
      result.fatalCrash = extractNumber(cells[0] || '0');
      result.injCrash = extractNumber(cells[1] || '0');
      result.towCrash = extractNumber(cells[2] || '0');
      result.crashTotal = extractNumber(cells[3] || '0') ||
        (result.fatalCrash + result.injCrash + result.towCrash);
      break;
    }
  }

  return result;
}

function parseCarrierHtml(html: string): CarrierData {
  const carrier: CarrierData = {
    dotNumber: '',
    legalName: '',
    dbaName: '',
    carrierOperation: '',
    hqAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    mailingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    phone: '',
    fax: '',
    email: '',
    mcNumber: '',
    mxNumber: '',
    statusCode: '',
    commonAuthorityStatus: '',
    contractAuthorityStatus: '',
    brokerAuthorityStatus: '',
    bondInsuranceOnFile: '',
    bondInsuranceRequired: '',
    bipdInsuranceOnFile: '',
    bipdInsuranceRequired: '',
    cargoInsuranceOnFile: '',
    cargoInsuranceRequired: '',
    safetyRating: '',
    safetyRatingDate: '',
    safetyReviewDate: '',
    safetyReviewType: '',
    oosDate: '',
    totalDrivers: 0,
    totalPowerUnits: 0,
    driverInsp: 0,
    driverOosInsp: 0,
    driverOosRate: 0,
    vehicleInsp: 0,
    vehicleOosInsp: 0,
    vehicleOosRate: 0,
    hazmatInsp: 0,
    hazmatOosInsp: 0,
    hazmatOosRate: 0,
    crashTotal: 0,
    fatalCrash: 0,
    injCrash: 0,
    towCrash: 0,
  };

  // Basic company info
  carrier.dotNumber = extractFieldAfterLabel(html, 'USDOT Number') ||
    extractFieldAfterLabel(html, 'DOT Number') ||
    extractFieldAfterLabel(html, 'USDOT');
  carrier.legalName = extractFieldAfterLabel(html, 'Legal Name') ||
    extractFieldAfterLabel(html, 'Entity Name');
  carrier.dbaName = extractFieldAfterLabel(html, 'DBA Name') ||
    extractFieldAfterLabel(html, 'Doing Business As');
  carrier.carrierOperation = extractFieldAfterLabel(html, 'Carrier Operation') ||
    extractFieldAfterLabel(html, 'Operation Classification');

  // MC/MX numbers
  carrier.mcNumber = extractFieldAfterLabel(html, 'MC/MX/FF Number') ||
    extractFieldAfterLabel(html, 'MC Number') ||
    extractFieldAfterLabel(html, 'MC/MX');
  // Clean MC number - extract just the number
  if (carrier.mcNumber) {
    const mcMatch = carrier.mcNumber.match(/(?:MC[-\s]?)?(\d+)/);
    if (mcMatch) carrier.mcNumber = `MC-${mcMatch[1]}`;
  }
  carrier.mxNumber = extractFieldAfterLabel(html, 'MX Number');

  // Status
  carrier.statusCode = extractFieldAfterLabel(html, 'Entity Type') ||
    extractFieldAfterLabel(html, 'Operating Status') ||
    extractFieldAfterLabel(html, 'Status');
  // Normalize to single-letter code if it's a full word
  if (carrier.statusCode.toUpperCase().includes('ACTIVE')) carrier.statusCode = 'A';
  if (carrier.statusCode.toUpperCase().includes('INACTIVE')) carrier.statusCode = 'I';

  carrier.oosDate = extractFieldAfterLabel(html, 'Out of Service Date') ||
    extractFieldAfterLabel(html, 'OOS Date');

  // Contact info
  carrier.phone = extractFieldAfterLabel(html, 'Phone');
  carrier.fax = extractFieldAfterLabel(html, 'Fax');
  carrier.email = extractFieldAfterLabel(html, 'Email') ||
    extractFieldAfterLabel(html, 'E-Mail');

  // Addresses
  carrier.hqAddress = parseAddressFromHtml(html, 'Physical Address') ||
    parseAddressFromHtml(html, 'Principal Address');
  if (!carrier.hqAddress.street) {
    carrier.hqAddress = parseAddressFromHtml(html, 'HQ Address');
  }
  carrier.mailingAddress = parseAddressFromHtml(html, 'Mailing Address');
  if (!carrier.mailingAddress.street) {
    carrier.mailingAddress = { ...carrier.hqAddress };
  }

  // Authority status
  carrier.commonAuthorityStatus = extractFieldAfterLabel(html, 'Common Authority') ||
    extractFieldAfterLabel(html, 'Common Carrier');
  carrier.contractAuthorityStatus = extractFieldAfterLabel(html, 'Contract Authority') ||
    extractFieldAfterLabel(html, 'Contract Carrier');
  carrier.brokerAuthorityStatus = extractFieldAfterLabel(html, 'Broker Authority') ||
    extractFieldAfterLabel(html, 'Broker');
  // Normalize authority statuses
  for (const field of ['commonAuthorityStatus', 'contractAuthorityStatus', 'brokerAuthorityStatus'] as const) {
    const val = carrier[field].toUpperCase();
    if (val.includes('ACTIVE') && !val.includes('INACTIVE')) carrier[field] = 'ACTIVE';
    else if (val.includes('INACTIVE')) carrier[field] = 'INACTIVE';
    else if (val === '' || val === 'NONE') carrier[field] = 'NONE';
  }

  // Insurance
  carrier.bipdInsuranceOnFile = extractFieldAfterLabel(html, 'BIPD Insurance.*On File') ||
    extractFieldAfterLabel(html, 'BIPD.*On File');
  carrier.bipdInsuranceRequired = extractFieldAfterLabel(html, 'BIPD Insurance.*Required') ||
    extractFieldAfterLabel(html, 'BIPD.*Required');
  carrier.cargoInsuranceOnFile = extractFieldAfterLabel(html, 'Cargo Insurance.*On File') ||
    extractFieldAfterLabel(html, 'Cargo.*On File');
  carrier.cargoInsuranceRequired = extractFieldAfterLabel(html, 'Cargo Insurance.*Required') ||
    extractFieldAfterLabel(html, 'Cargo.*Required');
  carrier.bondInsuranceOnFile = extractFieldAfterLabel(html, 'Bond.*On File') ||
    extractFieldAfterLabel(html, 'Surety.*On File');
  carrier.bondInsuranceRequired = extractFieldAfterLabel(html, 'Bond.*Required') ||
    extractFieldAfterLabel(html, 'Surety.*Required');

  // If we couldn't parse insurance individually, try looking for the insurance table
  if (!carrier.bipdInsuranceOnFile && !carrier.cargoInsuranceOnFile) {
    const insuranceSection = html.match(/Insurance[\s\S]*?(?=Safety|Inspections|$)/i);
    if (insuranceSection) {
      const insHtml = insuranceSection[0];
      // Try to find on-file amounts - SAFER shows dollar amounts like "1,000,000"
      const bipdMatch = insHtml.match(/BIPD[\s\S]*?(\$[\d,]+|\d[\d,]+|Yes|No|Y|N)/i);
      if (bipdMatch) {
        carrier.bipdInsuranceOnFile = bipdMatch[1].replace(/[$,]/g, '');
        carrier.bipdInsuranceRequired = 'Y';
      }
      const cargoMatch = insHtml.match(/Cargo[\s\S]*?(\$[\d,]+|\d[\d,]+|Yes|No|Y|N)/i);
      if (cargoMatch) {
        carrier.cargoInsuranceOnFile = cargoMatch[1].replace(/[$,]/g, '');
        carrier.cargoInsuranceRequired = 'Y';
      }
      const bondMatch = insHtml.match(/Bond|Surety[\s\S]*?(\$[\d,]+|\d[\d,]+|Yes|No|Y|N)/i);
      if (bondMatch) {
        carrier.bondInsuranceOnFile = bondMatch[1].replace(/[$,]/g, '');
        carrier.bondInsuranceRequired = 'Y';
      }
    }
  }

  // Safety rating
  carrier.safetyRating = extractFieldAfterLabel(html, 'Safety Rating') ||
    extractFieldAfterLabel(html, 'Rating');
  carrier.safetyRatingDate = extractFieldAfterLabel(html, 'Rating Date') ||
    extractFieldAfterLabel(html, 'Safety Rating Date');
  carrier.safetyReviewDate = extractFieldAfterLabel(html, 'Review Date') ||
    extractFieldAfterLabel(html, 'Safety Review Date');
  carrier.safetyReviewType = extractFieldAfterLabel(html, 'Review Type') ||
    extractFieldAfterLabel(html, 'Safety Review Type');

  // Fleet size
  const driversStr = extractFieldAfterLabel(html, 'Drivers') ||
    extractFieldAfterLabel(html, 'Total Drivers');
  carrier.totalDrivers = extractNumber(driversStr);

  const powerUnitsStr = extractFieldAfterLabel(html, 'Power Units') ||
    extractFieldAfterLabel(html, 'Total Power Units');
  carrier.totalPowerUnits = extractNumber(powerUnitsStr);

  // Inspections
  const inspections = parseInspectionTable(html);
  Object.assign(carrier, inspections);

  // Crashes
  const crashes = parseCrashTable(html);
  Object.assign(carrier, crashes);

  return carrier;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { dotNumber, mcNumber } = await req.json();

    // Validate input
    if (!dotNumber && !mcNumber) {
      return new Response(
        JSON.stringify({
          verified: false,
          status: 'error',
          message: 'Please provide a DOT number or MC number',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Build SAFER URL
    let saferUrl: string;
    if (dotNumber) {
      saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${dotNumber}`;
    } else {
      saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mcNumber}`;
    }

    // Fetch from FMCSA SAFER
    let html: string;
    try {
      const response = await fetch(saferUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DispatchLink Carrier Verification)',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`SAFER returned status ${response.status}`);
      }

      html = await response.text();
    } catch (fetchError: any) {
      if (fetchError.name === 'TimeoutError' || fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({
            verified: false,
            status: 'timeout',
            message: 'FMCSA SAFER database is not responding. Please try again in a moment.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }

    // Check if carrier was found
    const notFoundPatterns = [
      /no records? match/i,
      /no carrier found/i,
      /query returned 0 results/i,
      /record not found/i,
      /invalid.*search/i,
    ];

    for (const pattern of notFoundPatterns) {
      if (pattern.test(html)) {
        return new Response(
          JSON.stringify({
            verified: false,
            status: 'not_found',
            message: `No carrier found with ${dotNumber ? `DOT# ${dotNumber}` : `MC# ${mcNumber}`}. Please verify the number and try again.`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse the HTML
    const carrier = parseCarrierHtml(html);

    // If we couldn't extract a legal name, the page probably didn't have real data
    if (!carrier.legalName) {
      return new Response(
        JSON.stringify({
          verified: false,
          status: 'parse_error',
          message: 'Could not parse carrier information from FMCSA. The carrier may not exist or the SAFER page format may have changed.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build warnings
    const warnings: string[] = [];
    if (carrier.oosDate) {
      warnings.push(`Carrier is OUT OF SERVICE since ${carrier.oosDate}`);
    }
    if (carrier.statusCode === 'I' || carrier.statusCode.toUpperCase() === 'INACTIVE') {
      warnings.push('Carrier entity status is INACTIVE');
    }
    if (carrier.commonAuthorityStatus === 'INACTIVE') {
      warnings.push('Common carrier authority is INACTIVE');
    }
    if (carrier.driverOosRate > 25) {
      warnings.push(`High driver out-of-service rate: ${carrier.driverOosRate.toFixed(1)}%`);
    }
    if (carrier.vehicleOosRate > 30) {
      warnings.push(`High vehicle out-of-service rate: ${carrier.vehicleOosRate.toFixed(1)}%`);
    }
    if (carrier.safetyRating && carrier.safetyRating.toUpperCase().startsWith('U')) {
      warnings.push('Carrier has an UNSATISFACTORY safety rating');
    }

    // Determine verification status
    const isActive = carrier.statusCode === 'A' || carrier.statusCode.toUpperCase() === 'ACTIVE';
    const hasActiveAuthority = carrier.commonAuthorityStatus === 'ACTIVE' ||
      carrier.contractAuthorityStatus === 'ACTIVE';
    const verified = isActive && !carrier.oosDate;

    let message: string;
    if (verified && hasActiveAuthority) {
      message = `${carrier.legalName} is an active carrier with valid operating authority.`;
    } else if (verified) {
      message = `${carrier.legalName} is registered with FMCSA but operating authority status should be reviewed.`;
    } else if (carrier.oosDate) {
      message = `${carrier.legalName} is OUT OF SERVICE. Do not dispatch loads to this carrier.`;
    } else {
      message = `${carrier.legalName} was found but is not in active status. Review carefully before proceeding.`;
    }

    return new Response(
      JSON.stringify({
        verified,
        status: verified ? 'active' : 'inactive',
        carrier,
        message,
        warnings: warnings.length > 0 ? warnings : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('verify-dot-mc error:', error);
    return new Response(
      JSON.stringify({
        verified: false,
        status: 'error',
        message: 'An unexpected error occurred while verifying the carrier. Please try again.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
