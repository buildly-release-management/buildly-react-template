import { httpService } from '@modules/http/http.service';
import { useQuery } from 'react-query';

const getAllTaskCategoriesQuery = async (organizationUuid, displayAlert) => {
  try {
    const url = `${window.env.API_URL}product/task-categories/?organization_uuid=${organizationUuid}&is_active=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task categories: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different possible response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.results)) {
      return data.results;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Unexpected task categories response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching task categories:', error);
    if (displayAlert) {
      displayAlert('error', `Failed to fetch task categories: ${error.message}`);
    }
    return [];
  }
};

const useGetAllTaskCategories = (organizationUuid) => {
  return useQuery(
    ['taskCategories', organizationUuid],
    () => getAllTaskCategoriesQuery(organizationUuid),
    {
      enabled: !!organizationUuid,
      // Task categories are relatively static, longer cache for production
      staleTime: window.env?.PRODUCTION ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30min prod, 5min dev
      cacheTime: window.env?.PRODUCTION ? 2 * 60 * 60 * 1000 : 10 * 60 * 1000, // 2hr prod, 10min dev
      retry: window.env?.PRODUCTION ? 3 : 1,
    }
  );
};

export { getAllTaskCategoriesQuery, useGetAllTaskCategories };
