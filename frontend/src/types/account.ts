/**
 * Account related type definitions
 */

// Account status enum
export enum AccountStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

// Customer account request DTO
export interface CustomerAccountRequestDTO {
  custId: number;
  subProductId: number;
  accountName: string;
  currency: string;
  makerId: string;
}

// Customer account response DTO
export interface CustomerAccountResponseDTO {
  accountNo: string;
  custId: number;
  extCustId?: string;
  customerName?: string;
  subProductId: number;
  subProductCode?: string;
  subProductName?: string;
  accountName: string;
  currency: string;
  balance: number;
  interestAccrued: number;
  status: AccountStatus;
  openDate: string; // LocalDate as ISO string
  closeDate?: string; // LocalDate as ISO string
  makerId: string;
  interestRate?: number;
  message?: string; // Optional message from API
}

// Office account request DTO
export interface OfficeAccountRequestDTO {
  accountNo: string;
  accountName: string;
  currency: string;
  makerId: string;
}

// Office account response DTO
export interface OfficeAccountResponseDTO {
  accountNo: string;
  accountName: string;
  currency: string;
  balance: number;
  status: AccountStatus;
  openDate: string; // LocalDate as ISO string
  closeDate?: string; // LocalDate as ISO string
  makerId: string;
}
