import { httpService } from '@modules/http/http.service';
import { useQuery } from 'react-query';

const getAllTaskCategoriesQuery = (organizationUuid) => ({
  queryKey: ['taskCategories', organizationUuid],
  queryFn: async () => {
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
    return data;
  },
  enabled: !!organizationUuid,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

const useGetAllTaskCategories = (organizationUuid) => {
  return useQuery(getAllTaskCategoriesQuery(organizationUuid));
};

export { getAllTaskCategoriesQuery, useGetAllTaskCategories };
