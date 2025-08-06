import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';
import { useQuery } from 'react-query';
import { STANDARD_TASK_CATEGORIES } from '@utils/businessTaskConstants';
import { devLog } from '@utils/devLogger';

const getAllTaskCategoriesQuery = async (organizationUuid, displayAlert) => {
  try {
    // Check if user is authenticated
    if (!oauthService.hasValidAccessToken()) {
      devLog.warn('User not authenticated, using standard task categories');
      if (displayAlert) {
        displayAlert('warning', 'Using default task categories - please log in to access custom categories');
      }
      return STANDARD_TASK_CATEGORIES;
    }

    if (!organizationUuid) {
      devLog.warn('No organization UUID provided, using standard task categories');
      if (displayAlert) {
        displayAlert('warning', 'Organization not found - using default task categories');
      }
      return STANDARD_TASK_CATEGORIES;
    }

    const url = `${window.env.API_URL}product/task-categories/?organization_uuid=${organizationUuid}&is_active=true`;
    devLog.log('Fetching task categories from:', url);
    
    // Use httpService which handles authentication properly
    const response = await httpService.makeRequest(
      'GET',
      url,
      null,
      true // requireAuth
    );

    devLog.log('Task categories API response:', response);

    // Handle different possible response structures
    let categories = [];
    if (Array.isArray(response)) {
      categories = response;
    } else if (response && Array.isArray(response.results)) {
      categories = response.results;
    } else if (response && Array.isArray(response.data)) {
      categories = response.data;
    } else {
      devLog.warn('Unexpected task categories response structure:', response);
      categories = [];
    }

    // If no custom categories found, use standard ones
    if (!categories || categories.length === 0) {
      devLog.log('No custom categories found, using standard categories');
      return STANDARD_TASK_CATEGORIES;
    }

    // Transform API categories to match expected format if needed
    const transformedCategories = categories.map(cat => ({
      value: cat.value || cat.id || cat.name,
      label: cat.label || cat.name || cat.display_name,
      icon: cat.icon || '📦',
      ...cat
    }));

    devLog.log('Successfully fetched task categories:', transformedCategories);
    return transformedCategories;

  } catch (error) {
    devLog.error('Error fetching task categories:', error);
    console.error('Task categories API error details:', {
      message: error.message,
      response: error.response,
      status: error.status,
      organizationUuid
    });

    // Only show error alert if it's not a network/auth issue
    const isNetworkError = !error.response || error.response.status >= 500;
    const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
    
    if (displayAlert && !isNetworkError && !isAuthError) {
      displayAlert('error', `Failed to fetch custom task categories: ${error.message}`);
    } else if (displayAlert) {
      displayAlert('info', 'Using default task categories');
    }

    // Always return standard categories as fallback
    return STANDARD_TASK_CATEGORIES;
  }
};

const useGetAllTaskCategories = (organizationUuid, displayAlert) => {
  return useQuery(
    ['taskCategories', organizationUuid],
    () => getAllTaskCategoriesQuery(organizationUuid, displayAlert),
    {
      enabled: true, // Always enabled so we can fallback to standard categories
      // Task categories are relatively static, longer cache for production
      staleTime: window.env?.PRODUCTION ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30min prod, 5min dev
      cacheTime: window.env?.PRODUCTION ? 2 * 60 * 60 * 1000 : 10 * 60 * 1000, // 2hr prod, 10min dev
      retry: (failureCount, error) => {
        // Don't retry auth errors, but retry network errors
        const isAuthError = error?.response && (error.response.status === 401 || error.response.status === 403);
        if (isAuthError) return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Always return data even on error (fallback to standard categories)
      useErrorBoundary: false,
      // Don't refetch on window focus for categories
      refetchOnWindowFocus: false,
    }
  );
};

export { getAllTaskCategoriesQuery, useGetAllTaskCategories };
