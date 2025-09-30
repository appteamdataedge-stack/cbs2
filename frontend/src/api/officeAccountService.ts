/**
 * Office Account API service
 */
import type { OfficeAccountRequestDTO, OfficeAccountResponseDTO, Page } from '../types';
import { apiRequest } from './apiClient';

const ACCOUNTS_ENDPOINT = '/accounts/office';

/**
 * Get all office accounts with pagination
 */
export const getAllOfficeAccounts = async (page = 0, size = 10, sort?: string): Promise<Page<OfficeAccountResponseDTO>> => {
  let url = `${ACCOUNTS_ENDPOINT}?page=${page}&size=${size}`;
  if (sort) {
    url += `&sort=${sort}`;
  }
  
  return apiRequest<Page<OfficeAccountResponseDTO>>({
    method: 'GET',
    url,
  });
};

/**
 * Get office account by account number
 */
export const getOfficeAccountByAccountNo = async (accountNo: string): Promise<OfficeAccountResponseDTO> => {
  return apiRequest<OfficeAccountResponseDTO>({
    method: 'GET',
    url: `${ACCOUNTS_ENDPOINT}/${accountNo}`,
  });
};

/**
 * Create a new office account
 */
export const createOfficeAccount = async (account: OfficeAccountRequestDTO): Promise<OfficeAccountResponseDTO> => {
  return apiRequest<OfficeAccountResponseDTO>({
    method: 'POST',
    url: ACCOUNTS_ENDPOINT,
    data: account,
  });
};

/**
 * Update an existing office account
 */
export const updateOfficeAccount = async (accountNo: string, account: OfficeAccountRequestDTO): Promise<OfficeAccountResponseDTO> => {
  return apiRequest<OfficeAccountResponseDTO>({
    method: 'PUT',
    url: `${ACCOUNTS_ENDPOINT}/${accountNo}`,
    data: account,
  });
};

/**
 * Close an office account
 */
export const closeOfficeAccount = async (accountNo: string): Promise<OfficeAccountResponseDTO> => {
  return apiRequest<OfficeAccountResponseDTO>({
    method: 'POST',
    url: `${ACCOUNTS_ENDPOINT}/${accountNo}/close`,
  });
};
