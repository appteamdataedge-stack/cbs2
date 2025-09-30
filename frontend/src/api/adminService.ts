/**
 * Admin API service
 */
import type { EODResponse } from '../types';
import { apiRequest } from './apiClient';

const ADMIN_ENDPOINT = '/admin';

/**
 * Run End of Day (EOD) process
 */
export const runEOD = async (date?: string): Promise<EODResponse> => {
  let url = `${ADMIN_ENDPOINT}/run-eod`;
  if (date) {
    url += `?date=${date}`;
  }
  
  return apiRequest<EODResponse>({
    method: 'POST',
    url,
  });
};
