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
        .order('encoding_date', { ascending: false })
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
      if (app.status) statusValues.add(app.status);
    });
    console.log(`Unique status values in ${tableName} data:`, Array.from(statusValues));
    
    // Additional debugging for AUB specifically
    if (tableName === 'aub') {
      console.log(`AUB Debug: Total records: ${allData.length}`);
      if (allData.length > 0) {
        console.log(`AUB Debug: First record sample:`, allData[0]);
      }
    }
    
    return { data: allData, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching ${tableName} data:`, error);
    return { data: [], error };
  }
}

// Transform bank data to standard format
export function transformBankData(bankData: any[], bankName: string) {
  return bankData.map((app: any) => ({
    id: `${bankName}-${app.application_no || app.id || Math.random()}`,
    personal_details: {
      firstName: app.first_name || app.firstName || '',
      lastName: app.last_name || app.lastName || '',
      middleName: app.middle_name || app.middleName || '',
      emailAddress: app.email_address || app.email || '',
      mobileNumber: app.mobile_number || app.mobile || '',
    },
    status: app.status || '',
    agent: app.agent_cd || app.agent || app.agent_code || '',
    encoder: app.encoder || '',
    submitted_at: app.encoding_date || app.appln_date || app.created_at || app.submitted_at || null,
    isBankApplication: true,
    bankName: bankName,
    originalData: app,
    bank_preferences: { [bankName]: true },
    applicationNo: app.application_no || app.application_number || '',
    cardType: app.card_type || app.cardType || '',
    declineReason: app.decline_reason || app.declineReason || '',
    applnType: app.appln_type || app.applicationType || '',
    sourceCd: app.source_cd || app.sourceCode || '',
    agencyBrName: app.agency_br_name || app.agencyBranchName || '',
    month: app.month || '',
    remarks: app.remarks || '',
    oCodes: app.o_codes || app.ocodes || '',
  }));
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
          record[header] = values[index] || '';
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

