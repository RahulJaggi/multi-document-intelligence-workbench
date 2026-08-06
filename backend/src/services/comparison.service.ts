export interface StructuredRecord {
  customerId: string;
  name: string | null;
  dob: string | null;
  pan: string | null;
  aadhaar: string | null;
  mobile: string | null;
  address: string | null;
}

export interface ComparisonFieldResult {
  customerId: string;
  field: string;
  documentA: string;
  documentB: string;
  status: 'Match' | 'Mismatch' | 'Not Found';
}

const CUSTOMER_ID_PATTERNS = [
  /\b(?:customer\s*id|customer_id|client\s*id|id|cust\s*id)\s*[:=-]?\s*(C\d+)/i,
  /\b(?:customer\s*id|customer_id|client\s*id|id|cust\s*id)\s*[:=-]?\s*([a-zA-Z0-9_-]+)/i,
];
const NAME_PATTERNS = [
  /(?:name|full\s*name)\s*[:=-]\s*([^\n\r]+)/i,
  /(?:name|full\s*name)\s+([a-zA-Z\s.-]+)/i,
];
const DOB_PATTERNS = [
  /(?:dob|date\s*of\s*birth|birth\s*date)\s*[:=-]\s*([^\n\r]+)/i,
  /(?:dob|date\s*of\s*birth|birth\s*date)\s+([\d\w/.-]+)/i,
];
const PAN_PATTERNS = [
  /(?:pan|pan\s*no|pan\s*number)\s*[:=-]\s*([^\n\r]+)/i,
  /(?:pan|pan\s*no|pan\s*number)\s+([a-zA-Z0-9]+)/i,
];
const AADHAAR_PATTERNS = [
  /(?:aadhaar|aadhar|aadhaar\s*no|aadhaar\s*number|aadhar\s*no|uid)\s*[:=-]\s*([^\n\r]+)/i,
  /(?:aadhaar|aadhar|aadhaar\s*no|aadhaar\s*number|aadhar\s*no|uid)\s+([\d\s]+)/i,
];
const MOBILE_PATTERNS = [
  /(?:mobile|phone|mobile\s*no|mobile\s*number|phone\s*no|contact)\s*[:=-]\s*([^\n\r]+)/i,
  /(?:mobile|phone|mobile\s*no|mobile\s*number|phone\s*no|contact)\s+([\d\s+-]+)/i,
];
const ADDRESS_PATTERNS = [
  /(?:address)\s*[:=-]\s*([^\n\r]+)/i,
  /(?:address)\s+([^\n\r]+)/i,
];

/**
 * Extracts a specific field value using a series of RegExp patterns.
 */
const extractField = (text: string, patterns: RegExp[]): string | null => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = match[1].trim();
      return val === '' ? null : val;
    }
  }
  return null;
};

/**
 * Parses key-value formatted text (e.g. CSV-extracted rows, colon-separated PDFs).
 */
const parseKeyValueText = (text: string): StructuredRecord[] => {
  const records: StructuredRecord[] = [];

  // Split text by row dividers, double linebreaks, or linebreaks starting with customer id
  const blocks = text.split(
    /(?:-----------------------|\r?\n\r?\n|\r?\n(?=\b(?:customer\s*id|customer_id|client\s*id|cust\s*id)\b))/gi
  );

  for (const block of blocks) {
    const cleaned = block.trim();
    if (!cleaned) continue;

    const customerId = extractField(cleaned, CUSTOMER_ID_PATTERNS);
    if (customerId) {
      records.push({
        customerId,
        name: extractField(cleaned, NAME_PATTERNS),
        dob: extractField(cleaned, DOB_PATTERNS),
        pan: extractField(cleaned, PAN_PATTERNS),
        aadhaar: extractField(cleaned, AADHAAR_PATTERNS),
        mobile: extractField(cleaned, MOBILE_PATTERNS),
        address: extractField(cleaned, ADDRESS_PATTERNS),
      });
    }
  }

  return records;
};

/**
 * Parses tabular space-separated or comma-separated document formats.
 */
const parseTabularText = (text: string): StructuredRecord[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) return [];

  let headerLineIndex = -1;
  let headers: string[] = [];

  // Find the header row
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/[\s,|]+/).map((p) => p.trim().toLowerCase());

    if (parts.some((p) => p.includes('customer') || p.includes('client') || p === 'id')) {
      headerLineIndex = i;
      headers = line.split(/[\s,|]+/).map((p) => p.trim());
      break;
    }
  }

  if (headerLineIndex === -1) return [];

  const records: StructuredRecord[] = [];

  // Parse trailing lines as data records
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('---') || line.startsWith('===')) continue;

    // Split line by columns
    const values = line.split(/[\s,|]+/).map((p) => p.trim());
    if (values.length < 2) continue;

    let customerId = '';
    let name: string | null = null;
    let dob: string | null = null;
    let pan: string | null = null;
    let aadhaar: string | null = null;
    let mobile: string | null = null;
    let address: string | null = null;

    headers.forEach((header, index) => {
      const val = values[index] || null;
      const lowerHeader = header.toLowerCase();

      if (lowerHeader.includes('customer') || lowerHeader.includes('client') || lowerHeader === 'id') {
        customerId = val || '';
      } else if (lowerHeader.includes('name')) {
        name = val;
      } else if (lowerHeader.includes('dob') || lowerHeader.includes('birth')) {
        dob = val;
      } else if (lowerHeader.includes('pan')) {
        pan = val;
      } else if (lowerHeader.includes('aadhaar') || lowerHeader.includes('aadhar')) {
        aadhaar = val;
      } else if (lowerHeader.includes('mobile') || lowerHeader.includes('phone')) {
        mobile = val;
      } else if (lowerHeader.includes('address')) {
        // Address might contain multiple space-separated words, merge remaining columns
        address = values.slice(index).join(' ');
      }
    });

    // Strip out merged adjacent column text if CustomerID captures extra letters (e.g. C001Rahul -> C001)
    if (customerId) {
      const cleanIdMatch = customerId.match(/^(C\d+)/i);
      if (cleanIdMatch) {
        customerId = cleanIdMatch[1];
      }
    }

    if (customerId) {
      records.push({ customerId, name, dob, pan, aadhaar, mobile, address });
    }
  }

  return records;
};

/**
 * Splits extracted document text and parses structured client records.
 * Uses a hybrid approach supporting both key-value segments and tabular rows.
 */
export const extractRecords = (text: string): StructuredRecord[] => {
  let records = parseKeyValueText(text);

  if (records.length === 0) {
    records = parseTabularText(text);
  }

  return records;
};

/**
 * Programmatically and deterministically compares records from Document A and Document B.
 * Matches rows by Customer ID and compares selected fields.
 */
export const compareDocuments = (
  docAText: string,
  docBText: string
): ComparisonFieldResult[] => {
  const recordsA = extractRecords(docAText);
  const recordsB = extractRecords(docBText);

  const results: ComparisonFieldResult[] = [];

  // Index records by Customer ID
  const mapA = new Map<string, StructuredRecord>();
  recordsA.forEach((rec) => mapA.set(rec.customerId.toLowerCase(), rec));

  const mapB = new Map<string, StructuredRecord>();
  recordsB.forEach((rec) => mapB.set(rec.customerId.toLowerCase(), rec));

  // Find all unique customer IDs
  const allCustomerIds = new Set<string>([
    ...Array.from(mapA.keys()),
    ...Array.from(mapB.keys()),
  ]);

  const fieldsToCompare: (keyof Omit<StructuredRecord, 'customerId'>)[] = [
    'name',
    'dob',
    'pan',
    'aadhaar',
    'mobile',
    'address',
  ];

  const fieldLabels: Record<string, string> = {
    name: 'Name',
    dob: 'DOB',
    pan: 'PAN',
    aadhaar: 'Aadhaar',
    mobile: 'Mobile',
    address: 'Address',
  };

  allCustomerIds.forEach((lowerId) => {
    const recA = mapA.get(lowerId);
    const recB = mapB.get(lowerId);

    // Normalize display Customer ID
    const customerId = recA?.customerId || recB?.customerId || lowerId.toUpperCase();

    fieldsToCompare.forEach((field) => {
      const valA = recA ? recA[field] : null;
      const valB = recB ? recB[field] : null;

      let status: 'Match' | 'Mismatch' | 'Not Found';
      if (valA === null || valB === null) {
        status = 'Not Found';
      } else if (valA.trim().toLowerCase() === valB.trim().toLowerCase()) {
        status = 'Match';
      } else {
        status = 'Mismatch';
      }

      results.push({
        customerId,
        field: fieldLabels[field],
        documentA: valA || 'Not Found',
        documentB: valB || 'Not Found',
        status,
      });
    });
  });

  return results;
};
