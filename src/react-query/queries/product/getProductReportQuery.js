import { httpService } from '@modules/http/http.service';

export const getProductReportQuery = async (product_uuid, displayAlert) => {
  try {
    console.log('getProductReportQuery: Called with product_uuid:', product_uuid, 'Type:', typeof product_uuid);
    
    // Check if product_uuid is valid
    if (!product_uuid || product_uuid === 0 || product_uuid === '0') {
      console.log('getProductReportQuery: Invalid product_uuid, skipping API call');
      return {
        architecture_type: null,
        budget: null,
        budget_range: [0, 0],
        components_tree: [],
        feature_suggestions: [],
        message: 'No product selected'
      };
    }
    
    const url = `product/product/${product_uuid}/report/`;
    console.log('getProductReportQuery: Making request to:', url);
    console.log('getProductReportQuery: Full URL will be:', `${window.env.API_URL}${url}`);
    
    // Log authentication details (without exposing sensitive data)
    const hasToken = !!window.localStorage.getItem('access_token') || !!window.localStorage.getItem('authToken');
    console.log('getProductReportQuery: Has authentication token:', hasToken);
    
    // Test: Try to fetch the product details first to verify the product exists
    console.log('getProductReportQuery: Testing product existence first...');
    try {
      const productResponse = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}product/product/?product_uuid=${product_uuid}`,
      );
      console.log('getProductReportQuery: Product exists:', !!productResponse.data);
    } catch (productError) {
      console.log('getProductReportQuery: Product fetch error:', productError.response?.status);
      if (productError.response?.status === 404) {
        console.log('getProductReportQuery: Product not found, skipping report request');
        displayAlert('error', `Product not found: ${product_uuid}`);
        return {
          architecture_type: null,
          budget: null,
          budget_range: [0, 0],
          components_tree: [],
          feature_suggestions: [],
          message: 'Product not found'
        };
      }
    }
    
    
    // Try the direct product service first (from Swagger docs)
    console.log('getProductReportQuery: Trying direct product service first...');
    try {
      const directResponse = await httpService.sendDirectServiceRequest(
        `product/${product_uuid}/report/`,
        'GET',
        null,
        'product',
      );
      console.log('getProductReportQuery: Direct service success:', directResponse.data);
      return directResponse.data;
    } catch (directError) {
      console.log('getProductReportQuery: Direct service failed:', directError.response?.status);
    }
    
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}product/product/${product_uuid}/report/`,
    );
    console.log('getProductReportQuery: Full response:', response);
    console.log('getProductReportQuery: Response data structure:', Object.keys(response.data || {}));
    
    // Check if this is actually a report response or just product data
    const hasReportStructure = response.data && (
      response.data.architecture_type || 
      response.data.budget || 
      response.data.components_tree || 
      response.data.feature_suggestions
    );
    
    if (!hasReportStructure) {
      console.log('getProductReportQuery: Response looks like product data, not report data. Converting...');
      // The API returned product data instead of report data, let's create a report structure from real data
      const productData = response.data;
      console.log('getProductReportQuery: Product data keys:', Object.keys(productData));
      console.log('getProductReportQuery: Product info structure:', productData.product_info);
      
      // Use actual product data to build the report structure
      const productInfo = productData.product_info || {};
      
      return {
        architecture_type: productInfo.architecture_type || 'microservice',
        budget: productInfo.budget || null,
        budget_range: productInfo.budget_range || [0, 100000],
        components_tree: productInfo.components_tree || [],
        feature_suggestions: productInfo.feature_suggestions || [],
        message: `Report for ${productData.name}`,
        product_name: productData.name,
        product_uuid: productData.product_uuid,
        // Include real product metadata
        hosting: productInfo.hosting,
        storage: productInfo.storage,
        database: productInfo.database,
        language: productInfo.language,
        start_date: productData.start_date,
        end_date: productData.end_date,
        description: productData.description
      };
    }
    
    console.log('getProductReportQuery: Success response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getProductReportQuery: Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      product_uuid: product_uuid
    });
    
    // If it's a 404, the endpoint doesn't exist - provide fallback data
    if (error.response && error.response.status === 404) {
      console.log('getProductReportQuery: 404 - Product not found or endpoint missing');
      displayAlert('warning', `Product report not found for product: ${product_uuid}`);
      return {
        architecture_type: null,
        budget: null,
        budget_range: [0, 0],
        components_tree: [],
        feature_suggestions: [],
        message: 'Product report not found'
      };
    }
    
    displayAlert('error', "Couldn't fetch product report! Using fallback data.");
    return {
      architecture_type: null,
      budget: null,
      budget_range: [0, 0],
      components_tree: [],
      feature_suggestions: [],
      message: 'Error loading product report'
    };
  }
};
