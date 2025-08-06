import { httpService } from '@modules/http/http.service';

export const getProductPunchlistQuery = async (product_uuid, displayAlert) => {
  try {
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      return [];
    }
    
    const response = await httpService.sendDirectServiceRequest(
      `punchlist/by-product/${product_uuid}/`,
      'GET',
      null,
      'product'
    );
    
    return response.data;
  } catch (error) {
    console.error('getProductPunchlistQuery: Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      product_uuid: product_uuid
    });
    
    // If it's a 404, no punchlist items exist yet - return empty array
    if (error.response && error.response.status === 404) {
      return [];
    }
    
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch punchlist items! Using empty data.");
    }
    
    return [];
  }
};
