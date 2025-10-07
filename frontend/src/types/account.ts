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
  subProductId: number;
  acctName: string;
  dateOpening: string; // LocalDate as ISO string
  dateClosure?: string; // LocalDate as ISO string
  branchCode: string;
  accountStatus: AccountStatus;
  reconciliationRequired: boolean;
}

// Office account response DTO
export interface OfficeAccountResponseDTO {
  accountNo: string;
  subProductId: number;
  subProductName?: string;
  glNum?: string;
  acctName: string;
  dateOpening: string; // LocalDate as ISO string
  dateClosure?: string; // LocalDate as ISO string
  branchCode: string;
  accountStatus: AccountStatus;
  reconciliationRequired: boolean;
}
