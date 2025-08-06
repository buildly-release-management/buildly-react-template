import { httpService } from '@modules/http/http.service';

export const getProductBudgetQuery = async (product_uuid, displayAlert) => {
  try {
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      return {
        budget_uuid: null,
        product_uuid: product_uuid,
        total_budget: 0,
        release_budgets: [],
        last_updated: null
      };
    }
    
    try {
      // Try direct product service first
      const response = await httpService.sendDirectServiceRequest(
        `budget/by-product/${product_uuid}/`,
        'GET',
        null,
        'product'
      );
      return response.data;
    } catch (directError) {
      // If it's a 404, the budget doesn't exist yet - return empty structure without trying fallback
      if (directError.response && directError.response.status === 404) {
        console.log(`getProductBudgetQuery: No budget found for product ${product_uuid} (expected for new products)`);
        return {
          budget_uuid: null,
          product_uuid: product_uuid,
          total_budget: 0,
          release_budgets: [],
          last_updated: null
        };
      }
      
      // For other errors, fallback to main API
      console.log('getProductBudgetQuery: Direct service failed, trying main API...', directError.response?.status);
      const response = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}product/budget/by-product/${product_uuid}/`,
      );
      return response.data;
    }
  } catch (error) {
    // If it's a 404, the budget doesn't exist yet - return empty structure
    if (error.response && error.response.status === 404) {
      console.log(`getProductBudgetQuery: No budget found for product ${product_uuid} (expected for new products)`);
      return {
        budget_uuid: null,
        product_uuid: product_uuid,
        total_budget: 0,
        release_budgets: [],
        last_updated: null
      };
    }
    
    console.error('getProductBudgetQuery: Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      product_uuid: product_uuid
    });
    
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch product budget! Using empty data.");
    }
    
    return {
      budget_uuid: null,
      product_uuid: product_uuid,
      total_budget: 0,
      release_budgets: [],
      last_updated: null
    };
  }
};
