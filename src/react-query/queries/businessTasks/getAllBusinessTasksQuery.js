import { httpService } from '@modules/http/http.service';

export const getAllBusinessTasksQuery = async (filters, displayAlert) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle comma-separated status values
        if (key === 'status' && typeof value === 'string' && value.includes(',')) {
          const statusValues = value.split(',').map(s => s.trim());
          statusValues.forEach(status => {
            queryParams.append('status', status);
          });
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const queryString = queryParams.toString();
    const url = `${window.env.API_URL}product/business-tasks/${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    console.error('All Business Tasks Query Error:', error);
    displayAlert('error', 'Failed to fetch business tasks');
    throw error;
  }
};

export const getBusinessTasksByUserQuery = async (userUuid, filters, displayAlert) => {
  try {
    // Use the specific by-user endpoint from the API docs
    const queryParams = new URLSearchParams();
    
    // Add other filters (except assigned_to_user_uuid since it's in the URL path)
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && key !== 'assigned_to_user_uuid') {
        // Handle comma-separated status values
        if (key === 'status' && typeof value === 'string' && value.includes(',')) {
          const statusValues = value.split(',').map(s => s.trim());
          statusValues.forEach(status => {
            queryParams.append('status', status);
          });
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const queryString = queryParams.toString();
    const url = `${window.env.API_URL}product/business-tasks/by-user/${userUuid}/${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    console.error('Business Tasks Query Error:', error);
    console.error('Error response:', error.response);
    
    // Fallback to the generic endpoint if the by-user endpoint fails
    try {
      const queryParams = new URLSearchParams();
      
      // Add the user UUID filter
      if (userUuid) {
        queryParams.append('assigned_to_user_uuid', userUuid);
      }
      
      // Add other filters
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle comma-separated status values
          if (key === 'status' && typeof value === 'string' && value.includes(',')) {
            const statusValues = value.split(',').map(s => s.trim());
            statusValues.forEach(status => {
              queryParams.append('status', status);
            });
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const queryString = queryParams.toString();
      const fallbackUrl = `${window.env.API_URL}product/business-tasks/${queryString ? `?${queryString}` : ''}`;
      
      const fallbackResponse = await httpService.makeRequest('get', fallbackUrl);
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      displayAlert('error', `Failed to fetch user business tasks: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
};

export const getBusinessTasksByReleaseQuery = async (releaseUuid, filters, displayAlert) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add release UUID to filters if provided
    if (releaseUuid) {
      queryParams.append('release_uuid', releaseUuid);
    }
    
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle comma-separated status values
        if (key === 'status' && typeof value === 'string' && value.includes(',')) {
          const statusValues = value.split(',').map(s => s.trim());
          statusValues.forEach(status => {
            queryParams.append('status', status);
          });
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const queryString = queryParams.toString();
    const url = `${window.env.API_URL}product/business-tasks/${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    console.error('Release Business Tasks Query Error:', error);
    displayAlert('error', 'Failed to fetch release business tasks');
    throw error;
  }
};

export const getOverdueBusinessTasksQuery = async (productUuid, displayAlert) => {
  try {
    const url = `${window.env.API_URL}product/business-tasks/${productUuid}/overdue/`;
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    displayAlert('error', 'Failed to fetch overdue business tasks');
    throw error;
  }
};

export const getBusinessTaskDependenciesQuery = async (taskUuid, displayAlert) => {
  try {
    const url = `${window.env.API_URL}product/business-tasks/${taskUuid}/dependencies/`;
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    displayAlert('error', 'Failed to fetch task dependencies');
    throw error;
  }
};
