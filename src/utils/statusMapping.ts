/**
 * Status mapping utility to normalize different bank status values
 * into standard categories: pending, approved, rejected, cancelled
 */

// Standard status categories
export type StandardStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'unknown';

// Map various status terms to our standard categories
const statusMappings: Record<string, StandardStatus> = {
  // Pending/Processing statuses
  'pending': 'pending',
  'for verification': 'pending',
  'application processing': 'pending',
  'new application': 'pending',
  'on process': 'pending',
  'processing': 'pending',
  'in progress': 'pending',
  'under review': 'pending',
  'awaiting approval': 'pending',
  'verification': 'pending',
  'submitted': 'pending',
  
  // Approved statuses
  'approved': 'approved',
  'accepted': 'approved',
  'approve': 'approved',
  'approved w/ cif': 'approved',
  'successful': 'approved',
  'completed': 'approved',
  'confirmed': 'approved',
  
  // Rejected statuses
  'rejected': 'rejected',
  'declined': 'rejected',
  'application declined': 'rejected',
  'denied': 'rejected',
  'unsuccessful': 'rejected',
  'failed': 'rejected',
  
  // Cancelled statuses
  'cancelled': 'cancelled',
  'application cancelled': 'cancelled',
  'canceled': 'cancelled',
  'withdrawn': 'cancelled',
  'abandoned': 'cancelled',
};

/**
 * Normalizes a bank-specific status to one of our standard status categories
 * 
 * @param status The bank-specific status string
 * @returns A standardized status category
 */
export function normalizeStatus(status: string | null | undefined): StandardStatus {
  if (!status) return 'unknown';
  
  // Convert to lowercase for case-insensitive matching
  const normalizedStatus = status.toLowerCase().trim();
  
  // Direct match in our mapping
  if (statusMappings[normalizedStatus]) {
    return statusMappings[normalizedStatus];
  }
  
  // Partial match - check if the status contains any of our known terms
  for (const [term, standardStatus] of Object.entries(statusMappings)) {
    if (normalizedStatus.includes(term)) {
      return standardStatus;
    }
  }
  
  // Special case for "declined" with codes
  if (normalizedStatus.includes('declined')) {
    return 'rejected';
  }
  
  // Special case for "approved" with additional text
  if (normalizedStatus.includes('approved')) {
    return 'approved';
  }
  
  // If we can't determine the status, return unknown
  return 'unknown';
}

/**
 * Get the display color for a status
 * 
 * @param status The standardized status
 * @returns A Tailwind CSS color class
 */
export function getStatusColor(status: StandardStatus): string {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'approved': return 'text-green-600';
    case 'rejected': return 'text-red-600';
    case 'cancelled': return 'text-gray-600';
    default: return 'text-blue-600';
  }
}
