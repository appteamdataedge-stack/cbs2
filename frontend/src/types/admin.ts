/**
 * Admin related type definitions
 */

// EOD response
export interface EODResponse {
  date: string; // ISO date string
  processedCount: number;
  status: string;
}
