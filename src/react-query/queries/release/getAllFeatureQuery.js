import { useQuery } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { devLog } from '@utils/devLogger';

export const getAllFeatureQuery = async (product_uuid, displayAlert) => {
  try {
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      return [];
    }
    
    try {
      // Try direct release service first
      const response = await httpService.sendDirectServiceRequest(
        `feature/?product_uuid=${product_uuid}`,
        'GET',
        null,
        'release'
      );
      return response.data;
    } catch (directError) {
      // Fallback to main API if direct service fails
      devLog.log('getAllFeatureQuery: Direct service failed, trying main API...', directError.response?.status);
      const response = await httpService.makeRequest(
        'get',
        `${window.env.RELEASE_SERVICE_URL}feature/?product_uuid=${product_uuid}`,
      );
      return response.data;
    }
  } catch (error) {
    console.error('getAllFeatureQuery: Error fetching features:', error.response?.status);
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch all features!");
    }
    return [];
  }
};
