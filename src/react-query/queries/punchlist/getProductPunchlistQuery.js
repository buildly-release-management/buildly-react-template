import { httpService } from '@modules/http/http.service';

export const getProductPunchlistQuery = async (product_uuid, displayAlert) => {
  try {
    console.log('getProductPunchlistQuery: Called with product_uuid:', product_uuid);
    
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      console.log('getProductPunchlistQuery: Invalid product_uuid, returning empty punchlist');
      return [];
    }
    
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}punchlist/by-product/${product_uuid}/`,
    );
    
    console.log('getProductPunchlistQuery: Success response:', response.data);
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
      console.log('getProductPunchlistQuery: Punchlist not found, returning empty array');
      return [];
    }
    
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch punchlist items! Using empty data.");
    }
    
    return [];
  }
};
