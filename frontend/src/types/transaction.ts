/**
 * Transaction related type definitions
 */

// Debit/Credit flag enum (D = Debit, C = Credit)
export enum DrCrFlag {
  D = 'D',
  C = 'C'
}

// Transaction line DTO
export interface TransactionLineDTO {
  accountNo: string;
  drCrFlag: DrCrFlag;
  tranCcy: string;
  fcyAmt: number;
  exchangeRate: number;
  lcyAmt: number;
  udf1?: string;
}

// Transaction request DTO
export interface TransactionRequestDTO {
  valueDate: string; // ISO date string
  narration?: string;
  lines: TransactionLineDTO[];
}

// Transaction line response DTO
export interface TransactionLineResponseDTO {
  lineId: number;
  accountNo: string;
  accountName?: string;
  drCrFlag: DrCrFlag;
  tranCcy: string;
  fcyAmt: number;
  exchangeRate: number;
  lcyAmt: number;
  udf1?: string;
}

// Transaction response DTO
export interface TransactionResponseDTO {
  tranId: string;
  valueDate: string; // ISO date string
  entryDate: string; // ISO date string
  entryTime: string; // ISO time string
  narration?: string;
  totalAmount: number;
  userId: string;
  lines: TransactionLineResponseDTO[];
}
