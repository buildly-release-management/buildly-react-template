import { httpService } from '@modules/http/http.service';

export const getAllBusinessTasksQuery = async (filters, displayAlert) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `${window.env.API_URL}product/business-tasks/${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    displayAlert('error', 'Failed to fetch business tasks');
    throw error;
  }
};

export const getBusinessTasksByUserQuery = async (userUuid, filters, displayAlert) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `${window.env.API_URL}product/business-tasks/${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    displayAlert('error', 'Failed to fetch user business tasks');
    throw error;
  }
};

export const getBusinessTasksByReleaseQuery = async (releaseUuid, filters, displayAlert) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `${window.env.API_URL}product/business-tasks/${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
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
