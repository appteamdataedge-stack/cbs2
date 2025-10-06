/**
 * Transaction API service
 */
import type { TransactionRequestDTO, TransactionResponseDTO, Page } from '../types';
import { apiRequest } from './apiClient';

const TRANSACTIONS_ENDPOINT = '/transactions';

/**
 * Create a new transaction
 */
export const createTransaction = async (transaction: TransactionRequestDTO): Promise<TransactionResponseDTO> => {
  return apiRequest<TransactionResponseDTO>({
    method: 'POST',
    url: `${TRANSACTIONS_ENDPOINT}/entry`,
    data: transaction,
  });
};

/**
 * Get all transactions with pagination
 */
export const getAllTransactions = async (page = 0, size = 10, sort?: string): Promise<Page<TransactionResponseDTO>> => {
  let url = `${TRANSACTIONS_ENDPOINT}?page=${page}&size=${size}`;
  if (sort) {
    url += `&sort=${sort}`;
  }
  
  return apiRequest<Page<TransactionResponseDTO>>({
    method: 'GET',
    url,
  });
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (tranId: string): Promise<TransactionResponseDTO> => {
  return apiRequest<TransactionResponseDTO>({
    method: 'GET',
    url: `${TRANSACTIONS_ENDPOINT}/${tranId}`,
  });
};
