import { httpService } from '@modules/http/http.service';

export const getAllStatusQuery = async (product_uuid, displayAlert) => {
  try {
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      return [];
    }
    
    try {
      // Try direct release service first
      const response = await httpService.sendDirectServiceRequest(
        `status/?product_uuid=${product_uuid}`,
        'GET',
        null,
        'release'
      );
      return response.data;
    } catch (directError) {
      // Fallback to main API if direct service fails
      console.log('getAllStatusQuery: Direct service failed, trying main API...', directError.response?.status);
      const response = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}release/status/?product_uuid=${product_uuid}`,
      );
      return response.data;
    }
  } catch (error) {
    console.error('getAllStatusQuery: Error fetching statuses:', error.response?.status);
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch all statuses!");
    }
    return [];
  }
};
