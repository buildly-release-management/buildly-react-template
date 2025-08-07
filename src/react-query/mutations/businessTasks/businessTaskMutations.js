import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreateBusinessTaskMutation = (productUuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (taskData) => {
      // Validate required fields before sending to API
      if (!taskData.assigned_by_user_uuid) {
        throw new Error('assigned_by_user_uuid is required but missing from task data');
      }
      
      if (!taskData.product_uuid) {
        throw new Error('product_uuid is required but missing from task data');
      }

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
        // Enhanced error logging for debugging
        console.error('Business task creation failed:', {
          error: error,
          message: error.message,
          response: error.response,
          data: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        });

        let errorMessage = 'Failed to create business task';
        
        // Handle specific database constraint violations
        if (error?.message?.includes('assigned_by_user_uuid') || 
            error?.response?.data?.detail?.includes('assigned_by_user_uuid')) {
          errorMessage = 'User session error: The task creator information is missing. Please refresh the page and try again.';
        } else if (error?.response?.data?.detail?.includes('Failing row contains')) {
          // Handle database constraint violations
          errorMessage = 'Data validation error: Some required fields may have invalid values. Please check all fields and try again.';
        } else if (error?.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else {
            // Try to extract field-specific errors
            const fieldErrors = [];
            Object.keys(error.response.data).forEach(field => {
              if (Array.isArray(error.response.data[field])) {
                fieldErrors.push(`${field}: ${error.response.data[field].join(', ')}`);
              } else if (typeof error.response.data[field] === 'string') {
                fieldErrors.push(`${field}: ${error.response.data[field]}`);
              }
            });
            
            if (fieldErrors.length > 0) {
              errorMessage = `Validation errors: ${fieldErrors.join('; ')}`;
            }
          }
        }
        
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

export const useBulkImportBusinessTasksMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ productUuid, csvData }) => {
      const formData = new FormData();
      formData.append('csv_file', csvData);
      formData.append('product_uuid', productUuid);

      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/business-tasks/bulk-import/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: async (data) => {
        const { created_count, error_count } = data;
        displayAlert('success', `Successfully imported ${created_count} business tasks${error_count > 0 ? ` (${error_count} errors)` : ''}`);
        // Invalidate relevant queries
        await queryClient.invalidateQueries(['businessTasks']);
        await queryClient.invalidateQueries(['businessTasksByUser']);
        await queryClient.invalidateQueries(['businessTasksByRelease']);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to import business tasks';
        displayAlert('error', errorMessage);
      },
    }
  );
};

export const useBulkExportBusinessTasksMutation = (displayAlert) => {
  return useMutation(
    async ({ productUuid, filters }) => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `${window.env.API_URL}product/business-tasks/export/${productUuid}/${queryString ? `?${queryString}` : ''}`;
      
      const response = await httpService.makeRequest('get', url, null, {
        responseType: 'blob',
      });
      
      // Create a download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url2;
      link.setAttribute('download', `business-tasks-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url2);
      
      return response.data;
    },
    {
      onSuccess: () => {
        displayAlert('success', 'Business tasks exported successfully');
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.detail || 'Failed to export business tasks';
        displayAlert('error', errorMessage);
      },
    }
  );
};
