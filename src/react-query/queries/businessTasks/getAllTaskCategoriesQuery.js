import { httpService } from '@modules/http/http.service';

export const getAllTaskCategoriesQuery = async (organizationUuid, displayAlert) => {
  try {
    const url = `${window.env.API_URL}task-categories/?organization_uuid=${organizationUuid}&is_active=true`;
    const response = await httpService.makeRequest('get', url);
    return response.data;
  } catch (error) {
    displayAlert('error', 'Failed to fetch task categories');
    throw error;
  }
};
