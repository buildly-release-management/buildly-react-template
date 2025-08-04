import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreateTaskCategoryMutation = (organizationUuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (categoryData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/task-categories/`,
        { ...categoryData, organization_uuid: organizationUuid },
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Task category created successfully');
        await queryClient.invalidateQueries(['taskCategories', organizationUuid]);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to create task category';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useUpdateTaskCategoryMutation = (organizationUuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ categoryUuid, categoryData }) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}product/task-categories/${categoryUuid}/`,
        categoryData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Task category updated successfully');
        await queryClient.invalidateQueries(['taskCategories', organizationUuid]);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to update task category';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useDeleteTaskCategoryMutation = (organizationUuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (categoryUuid) => {
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}product/task-categories/${categoryUuid}/`,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Task category deleted successfully');
        await queryClient.invalidateQueries(['taskCategories', organizationUuid]);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete task category';
        displayAlert('error', errorMessage);
      },
    }
  );
};
