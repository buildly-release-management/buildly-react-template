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
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export { getAllTaskCategoriesQuery, useGetAllTaskCategories };
