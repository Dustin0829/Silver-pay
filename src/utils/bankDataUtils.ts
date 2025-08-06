import { supabase } from '../supabaseClient';

// Bank table configuration
export const BANK_TABLES = {
  maybank: 'maybank',
  bpi: 'bpi',
  rcbc: 'rcbc',
  metrobank: 'metrobank',
  eastwest: 'eastwest',
  pnb: 'pnb',
  aub: 'aub',
  robinsons: 'robinsons',
} as const;

export type BankTableName = keyof typeof BANK_TABLES;

// Status mapping for each bank based on their boolean fields
export function getBankStatus(app: any, bankName: string): string {
  switch (bankName) {
    case 'aub':
      if (app.approved) return 'approved';
      if (app.declined) return 'rejected';
      if (app.incomplete) return 'incomplete';
      return 'pending';
    
    case 'bpi':
      if (app.approved) return 'approved';
      if (app.existing_bpi || app.existing_rbank) return 'existing';
      if (app.in_process) return 'in_process';
      if (app.cancelled) return 'cancelled';
      if (app.denied) return 'rejected';
      return 'pending';
    
    case 'eastwest':
      if (app.approved) return 'approved';
      if (app.cancelled) return 'cancelled';
      if (app.declined) return 'rejected';
      if (app.pending) return 'pending';
      return 'pending';
    
    case 'maybank':
      if (app.approved) return 'approved';
      if (app.in_process) return 'in_process';
      if (app.declined) return 'rejected';
      if (app.cancelled) return 'cancelled';
      return 'pending';
    
    case 'metrobank':
      if (app.approved) return 'approved';
      if (app.declined) return 'rejected';
      if (app.incomplete) return 'incomplete';
      return 'pending';
    
    case 'pnb':
      if (app.approved) return 'approved';
      return 'pending';
    
    case 'robinsons':
      if (app.approved) return 'approved';
      if (app.existing_bpi || app.existing_rbank) return 'existing';
      if (app.in_process) return 'in_process';
      if (app.cancelled) return 'cancelled';
      if (app.denied) return 'rejected';
      return 'pending';
    
    case 'rcbc':
      if (app.approved) return 'approved';
      if (app.incomplete) return 'incomplete';
      if (app.in_process) return 'in_process';
      if (app.rejected) return 'rejected';
      return 'pending';
    
    default:
      return 'pending';
  }
}

// Generic function to fetch all records from a bank table with pagination
export async function fetchBankTableData(tableName: string) {
  try {
    console.log(`Fetching data from ${tableName} table...`);
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    if (countError) {
      console.error(`Error getting ${tableName} count:`, countError);
      return { data: [], error: countError };
    }
    console.log(`Total ${tableName} records available:`, totalCount);
    // Fetch all records with pagination
    let allData: any[] = [];
    let currentCount = 0;
    const batchSize = 1000;
    const totalRecords = totalCount || 0;
    while (currentCount < totalRecords) {
      const { data: batchData, error: batchError } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: false })
        .range(currentCount, currentCount + batchSize - 1);
      if (batchError) {
        console.error(`Error fetching ${tableName} batch:`, batchError);
        break;
      }
      if (batchData && batchData.length > 0) {
        console.log(`Fetched ${tableName} batch: ${batchData.length} records`);
        allData = [...allData, ...batchData];
        currentCount += batchData.length;
      } else {
        break;
      }
    }
    console.log(`Total ${tableName} records fetched: ${allData.length} of ${totalRecords}`);
    
    // Log unique status values for debugging
    const statusValues = new Set();
    allData.forEach((app: any) => {
      const status = getBankStatus(app, tableName);
      statusValues.add(status);
    });
    console.log(`Unique status values in ${tableName} data:`, Array.from(statusValues));
    
    return { data: allData, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching ${tableName} data:`, error);
    return { data: [], error };
  }
}

// Transform bank data to standard format
export function transformBankData(bankData: any[], bankName: string) {
  return bankData.map((app: any) => {
    const status = getBankStatus(app, bankName);
    
    return {
      id: `${bankName}-${app.id}`,
      personal_details: {
        firstName: app.client_name ? app.client_name.split(' ')[0] || '' : '',
        lastName: app.client_name ? app.client_name.split(' ').slice(1).join(' ') || '' : '',
        middleName: '',
        emailAddress: '',
        mobileNumber: '',
      },
      status: status,
      agent: app.agent_name || '',
      encoder: app.agent_name || '',
      submitted_at: app.created_at || new Date().toISOString(),
      isBankApplication: true,
      bankName: bankName,
      originalData: app,
      bank_preferences: { [bankName]: true },
      applicationNo: app.id?.toString() || '',
      cardType: '',
      declineReason: app.reasons || '',
      applnType: '',
      sourceCd: app.bank_code || '',
      agencyBrName: '',
      month: '',
      remarks: app.reasons || '',
      oCodes: '',
      client_name: app.client_name || '',
      bank_code: app.bank_code || '',
      agent_name: app.agent_name || '',
    };
  });
}

// CSV Import functionality
export async function importCSVToBankTable(file: File, tableName: string) {
  try {
    console.log(`Importing CSV to ${tableName} table...`);
    
    // Read the CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row.');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Validate headers
    if (headers.length === 0) {
      throw new Error('CSV file must contain valid headers.');
    }
    
    // Parse CSV data with better handling of quoted values
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        const record: any = {};
        headers.forEach((header, index) => {
          let value = values[index] || '';
          
          // Convert boolean fields based on the table
          if (isBooleanField(header, tableName)) {
            record[header] = convertToBoolean(value);
          } else {
            record[header] = value;
          }
        });
        records.push(record);
      }
    }
    
    console.log(`Parsed ${records.length} records from CSV`);
    
    if (records.length === 0) {
      throw new Error('No valid data rows found in CSV file.');
    }
    
    // Insert data into Supabase table in batches to handle large files
    const batchSize = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (error) {
        console.error(`Error importing batch to ${tableName}:`, error);
        throw error;
      }
      
      totalInserted += batch.length;
      console.log(`Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
    }
    
    console.log(`Successfully imported ${totalInserted} records to ${tableName}`);
    return { success: true, count: totalInserted };
    
  } catch (error) {
    console.error(`Error importing CSV to ${tableName}:`, error);
    throw error;
  }
}

// Helper function to check if a field should be boolean
function isBooleanField(header: string, tableName: string): boolean {
  const booleanFields = {
    aub: ['approved', 'declined', 'incomplete'],
    bpi: ['approved', 'existing_bpi', 'existing_rbank', 'in_process', 'cancelled', 'denied'],
    eastwest: ['approved', 'cancelled', 'declined', 'pending'],
    maybank: ['approved', 'in_process', 'declined', 'cancelled'],
    metrobank: ['approved', 'declined', 'incomplete'],
    pnb: ['approved'],
    robinsons: ['approved', 'existing_bpi', 'existing_rbank', 'in_process', 'cancelled', 'denied'],
    rcbc: ['approved', 'incomplete', 'in_process', 'rejected']
  };
  
  return booleanFields[tableName as keyof typeof booleanFields]?.includes(header) || false;
}

// Helper function to convert string values to boolean
function convertToBoolean(value: string): boolean {
  if (typeof value === 'boolean') return value;
  
  const stringValue = String(value).toLowerCase().trim();
  
  // Values that should be converted to true
  if (['true', '1', 'yes', 'y', 'approved', 'complete', 'active', 'on'].includes(stringValue)) {
    return true;
  }
  
  // Values that should be converted to false
  if (['false', '0', 'no', 'n', 'declined', 'rejected', 'incomplete', 'cancelled', 'denied', 'pending', 'off', ''].includes(stringValue)) {
    return false;
  }
  
  // For any other value, try to parse it as a number or default to false
  const numValue = parseFloat(stringValue);
  if (!isNaN(numValue)) {
    return numValue !== 0;
  }
  
  // Default to false for unrecognized values
  console.warn(`Unknown boolean value: "${value}", defaulting to false`);
  return false;
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Handle CSV file upload
export function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>, tableName: string, onSuccess?: (count: number) => void, onError?: (error: any) => void) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    onError?.('Please select a CSV file');
    return;
  }
  
  importCSVToBankTable(file, tableName)
    .then((result) => {
      onSuccess?.(result.count);
    })
    .catch((error) => {
      onError?.(error);
    });
}

