import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreateBusinessTaskMutation = (productUuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (taskData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/business-tasks/`,
        taskData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Business task created successfully');
        // Invalidate relevant queries
        await queryClient.invalidateQueries(['businessTasks']);
        await queryClient.invalidateQueries(['businessTasksByUser']);
        await queryClient.invalidateQueries(['businessTasksByRelease']);
        await queryClient.invalidateQueries(['overdueBusinessTasks']);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to create business task';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useUpdateBusinessTaskMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ taskUuid, taskData }) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}product/business-tasks/${taskUuid}/`,
        taskData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Business task updated successfully');
        // Invalidate relevant queries
        await queryClient.invalidateQueries(['businessTasks']);
        await queryClient.invalidateQueries(['businessTasksByUser']);
        await queryClient.invalidateQueries(['businessTasksByRelease']);
        await queryClient.invalidateQueries(['overdueBusinessTasks']);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to update business task';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useUpdateTaskProgressMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ taskUuid, progressData }) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}product/business-tasks/${taskUuid}/update_progress/`,
        progressData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Task progress updated successfully');
        // Invalidate relevant queries
        await queryClient.invalidateQueries(['businessTasks']);
        await queryClient.invalidateQueries(['businessTasksByUser']);
        await queryClient.invalidateQueries(['businessTasksByRelease']);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to update task progress';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useCloneBusinessTaskMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ taskUuid, cloneData }) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/business-tasks/${taskUuid}/clone/`,
        cloneData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Business task cloned successfully');
        // Invalidate relevant queries
        await queryClient.invalidateQueries(['businessTasks']);
        await queryClient.invalidateQueries(['businessTasksByUser']);
        await queryClient.invalidateQueries(['businessTasksByRelease']);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to clone business task';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useDeleteBusinessTaskMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (taskUuid) => {
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}product/business-tasks/${taskUuid}/`,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Business task deleted successfully');
        // Invalidate relevant queries
        await queryClient.invalidateQueries(['businessTasks']);
        await queryClient.invalidateQueries(['businessTasksByUser']);
        await queryClient.invalidateQueries(['businessTasksByRelease']);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete business task';
        displayAlert('error', errorMessage);
      },
    }
  );
};
