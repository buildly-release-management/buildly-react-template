import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getAllReleaseQuery = async (product_uuid, displayAlert) => {
  try {
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      return [];
    }
    
    try {
      // Try direct release service first
      const response = await httpService.sendDirectServiceRequest(
        `release/?product_uuid=${product_uuid}`,
        'GET',
        null,
        'release'
      );
      return response.data;
    } catch (directError) {
      // Fallback to main API if direct service fails
      console.log('getAllReleaseQuery: Direct service failed, trying main API...', directError.response?.status);
      const response = await httpService.makeRequest(
        'get',
        `${window.env.RELEASE_SERVICE_URL}release/?product_uuid=${product_uuid}`,
      );
      return response.data;
    }
  } catch (error) {
    console.error('getAllReleaseQuery: Error fetching releases:', error.response?.status);
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch all releases!");
    }
    return [];
  }
};
