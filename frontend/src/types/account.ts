/**
 * Account related type definitions
 */

// Account status enum
export enum AccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive', 
  CLOSED = 'Closed',
  DORMANT = 'Dormant'
}

// Customer account request DTO
export interface CustomerAccountRequestDTO {
  custId: number;
  subProductId: number;
  custName?: string;
  acctName: string;
  dateOpening: string; // LocalDate as ISO string
  tenor?: number;
  dateMaturity?: string; // LocalDate as ISO string
  dateClosure?: string; // LocalDate as ISO string
  branchCode: string;
  accountStatus: AccountStatus;
}

// Customer account response DTO
export interface CustomerAccountResponseDTO {
  accountNo: string;
  subProductId: number;
  subProductName?: string;
  glNum?: string;
  custId: number;
  custName?: string;
  acctName: string;
  dateOpening: string; // LocalDate as ISO string
  tenor?: number;
  dateMaturity?: string; // LocalDate as ISO string
  dateClosure?: string; // LocalDate as ISO string
  branchCode: string;
  accountStatus: AccountStatus;
  currentBalance?: number;
  availableBalance?: number;
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
