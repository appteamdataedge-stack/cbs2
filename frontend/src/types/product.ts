/**
 * Product related type definitions
 */

// GL Setup response DTO
export interface GLSetupResponseDTO {
  glName: string;
  layerId: number;
  layerGLNum: string;
  parentGLNum: string;
  glNum: string;
}

// Product request DTO
export interface ProductRequestDTO {
  productCode: string;
  productName: string;
  productType: string;
  cumGLNum: string; // GL Number field
  makerId: string;
}

// Product response DTO
export interface ProductResponseDTO {
  productId: number;
  productCode: string;
  productName: string;
  productType: string;
  cumGLNum: string; // GL Number field
  makerId: string;
  entryDate: string; // LocalDate as ISO string
  entryTime: string; // LocalTime as ISO string
  verifierId?: string;
  verificationDate?: string; // LocalDate as ISO string
  verificationTime?: string; // LocalTime as ISO string
  verified: boolean;
}
