/**
 * GL Setup API service
 */
import type { GLSetupResponseDTO } from '../types';
import { apiRequest } from './apiClient';

const GL_SETUP_ENDPOINT = '/gl-setup';

/**
 * Get GL setups by layer ID
 */
export const getGLSetupsByLayerId = async (layerId: number): Promise<GLSetupResponseDTO[]> => {
  return apiRequest<GLSetupResponseDTO[]>({
    method: 'GET',
    url: `${GL_SETUP_ENDPOINT}/layer/${layerId}`,
  });
};
