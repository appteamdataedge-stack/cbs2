/**
 * Transaction API service
 */
import type { TransactionRequestDTO, TransactionResponseDTO } from '../types';
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
 * Get transaction by ID
 */
export const getTransactionById = async (tranId: string): Promise<TransactionResponseDTO> => {
  return apiRequest<TransactionResponseDTO>({
    method: 'GET',
    url: `${TRANSACTIONS_ENDPOINT}/${tranId}`,
  });
};
