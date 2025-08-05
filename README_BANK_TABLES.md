# Silver-pay Bank Tables Integration

This document explains how bank-specific tables are integrated into the Admin and Moderator dashboards.

## Overview

The application now fetches data directly from bank-specific tables (like `maybank`, `bpi`, `rcbc`, etc.) and displays them in the Status Report section. This allows admins and moderators to see application statuses for each bank without having to manually update the bank status for each application.

## Table Structure

Each bank has its own table with the following structure (similar to Maybank's structure):

```sql
CREATE TABLE <bank_name> (
    application_no CITEXT PRIMARY KEY,
    encoding_date DATE,
    last_name CITEXT,
    first_name CITEXT,
    middle_name CITEXT,
    status CITEXT,
    report_date DATE,
    card_type CITEXT,
    decline_reason TEXT,
    appln_type CITEXT,
    source_cd CITEXT,
    agent_cd CITEXT,
    agent CITEXT,
    appln_date DATE,
    agency_br_name CITEXT,
    month CITEXT,
    column_1 CITEXT,
    column_2 CITEXT,
    remarks TEXT,
    o_codes TEXT
);
```

## Implementation Details

### 1. Data Fetching

We've updated the application to fetch data from each bank-specific table:

```typescript
// Fetch bank-specific applications from their respective tables
const fetchBankApplications = async () => {
  try {
    // Fetch Maybank applications
    const { data: maybankData, error: maybankError } = await supabase
      .from('maybank')
      .select('*')
      .order('encoding_date', { ascending: false });
      
    // Process Maybank data...
    
    // Fetch other bank data (BPI, RCBC, etc.)
    // ...
  } catch (err) {
    console.error('Unexpected error fetching bank applications:', err);
  }
};
```

### 2. Data Normalization

The bank data is normalized to match the standard application format:

```typescript
const normalizedMaybankApps = maybankData.map((app: any) => ({
  id: `maybank-${app.application_no}`,
  personal_details: {
    firstName: app.first_name || '',
    lastName: app.last_name || '',
    middleName: app.middle_name || '',
    // ...
  },
  status: app.status || '',
  agent: app.agent_cd || app.agent || '',
  submitted_at: app.encoding_date || app.appln_date || app.created_at || null,
  isMaybankApplication: true,  // Flag to identify the bank source
  originalData: app,
  // Additional fields...
}));
```

### 3. Real-time Updates

Real-time subscriptions are set up for each bank table:

```typescript
const maybankChannel = supabase
  .channel('realtime:maybank')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'maybank' },
    () => {
      console.log('Maybank application data changed');
      fetchBankApplications();
    }
  )
  .subscribe();
```

### 4. Status Report Section

The Status Report section now intelligently shows:
- Bank-specific stats (total, pending, approved, rejected)
- Combined data from both bank-specific tables and the bank status table
- Visual indicators for different status types

## Usage

1. **View Bank Status**: Navigate to the "Status Report" section to see application statistics for each bank.

2. **Bank Details**: Click on a bank card to see detailed application data for that specific bank.

3. **Data Source**: 
   - Applications from bank-specific tables (like `maybank`) are displayed with their status directly from the table.
   - Applications from the general KYC table with bank_status entries continue to be displayed as before.

## Technical Notes

- The Status Report section prioritizes data from bank-specific tables.
- For banks without dedicated tables, it falls back to the bank_status table.
- All bank tables should follow the same schema structure for consistency.
- Real-time updates ensure that changes to any bank table are immediately reflected in the UI.

## Future Improvements

1. Add CSV import functionality specific to each bank's table structure.
2. Implement direct editing of bank table entries.
3. Add bank-specific filters and export options.