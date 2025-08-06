import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreatePunchlistItemMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (punchlistData) => {
      console.log('useCreatePunchlistItemMutation: Creating punchlist item for product:', product_uuid);
      console.log('useCreatePunchlistItemMutation: Punchlist data:', punchlistData);
      
      // Validate required fields before sending to API
      const requiredFields = [
        { field: 'product_uuid', value: punchlistData.product_uuid || product_uuid },
        { field: 'reporter_name', value: punchlistData.reporter_name },
        { field: 'reporter_email', value: punchlistData.reporter_email },
        { field: 'application_name', value: punchlistData.application_name },
        { field: 'version', value: punchlistData.version },
        { field: 'title', value: punchlistData.title }, // Will be mapped to issue_title
        { field: 'description', value: punchlistData.description },
        { field: 'expected_behavior', value: punchlistData.expected_behavior }
      ];
      
      const missingFields = requiredFields.filter(item => !item.value || item.value.trim() === '');
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.map(f => f.field).join(', ')}`);
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(punchlistData.reporter_email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Map frontend fields to API expected fields with proper defaults
      const apiPayload = {
        product_uuid: punchlistData.product_uuid || product_uuid,
        reporter_name: punchlistData.reporter_name.trim(),
        reporter_email: punchlistData.reporter_email.trim().toLowerCase(),
        application_name: punchlistData.application_name.trim(),
        version: punchlistData.version.trim(),
        issue_title: punchlistData.title.trim(), // Map title to issue_title
        description: punchlistData.description.trim(),
        expected_behavior: punchlistData.expected_behavior.trim(),
        // Optional fields with proper defaults
        severity: punchlistData.severity || 'medium',
        priority: punchlistData.priority || 'medium',
        steps_to_reproduce: punchlistData.steps_to_reproduce || '',
        actual_behavior: punchlistData.actual_behavior || '',
        environment: punchlistData.environment || '',
        browser_version: punchlistData.browser_version || '',
        screenshots: punchlistData.screenshots || [],
        assigned_to: punchlistData.assigned_to || '',
        tags: punchlistData.tags || [],
        release_uuid: punchlistData.release_uuid,
        date_created: punchlistData.date_created || new Date().toISOString(),
        status: punchlistData.status || 'open'
      };
      
      console.log('useCreatePunchlistItemMutation: Transformed API payload:', apiPayload);
      
      const response = await httpService.sendDirectServiceRequest(
        'punchlist/',
        'POST',
        apiPayload,
        'product'
      );
      return response.data;
    },
    {
      onSuccess: async (data) => {
        if (displayAlert) {
          displayAlert('success', 'Punchlist item created successfully');
        }
        // Invalidate and refetch punchlist queries
        await queryClient.invalidateQueries(['productPunchlist', product_uuid]);
        console.log('useCreatePunchlistItemMutation: Punchlist item created successfully:', data);
      },
      onError: (error) => {
        console.error('useCreatePunchlistItemMutation: Error creating punchlist item:', error);
        if (displayAlert) {
          displayAlert('error', 'Failed to create punchlist item');
        }
      },
    }
  );
};

export const useUpdatePunchlistStatusMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ punchlist_uuid, status, assigned_to, resolution_notes }) => {
      console.log('useUpdatePunchlistStatusMutation: Updating punchlist item:', punchlist_uuid);
      
      // Validate required parameters
      if (!punchlist_uuid) {
        throw new Error('Punchlist UUID is required for status update');
      }
      if (!status) {
        throw new Error('Status is required for punchlist update');
      }
      
      const updatePayload = {
        status: status.trim(),
        assigned_to: assigned_to || '',
        resolution_notes: resolution_notes || ''
      };
      
      console.log('useUpdatePunchlistStatusMutation: Update payload:', updatePayload);
      
      const response = await httpService.sendDirectServiceRequest(
        `punchlist/${punchlist_uuid}/update-status/`,
        'PATCH',
        updatePayload,
        'product'
      );
      return response.data;
    },
    {
      onSuccess: async (data) => {
        if (displayAlert) {
          displayAlert('success', 'Punchlist status updated successfully');
        }
        // Invalidate and refetch punchlist queries
        await queryClient.invalidateQueries(['productPunchlist', product_uuid]);
        console.log('useUpdatePunchlistStatusMutation: Status updated successfully:', data);
      },
      onError: (error) => {
        console.error('useUpdatePunchlistStatusMutation: Error updating status:', error);
        if (displayAlert) {
          displayAlert('error', 'Failed to update punchlist status');
        }
      },
    }
  );
};

export const useDeletePunchlistItemMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (punchlist_uuid) => {
      console.log('useDeletePunchlistItemMutation: Deleting punchlist item:', punchlist_uuid);
      
      // Validate required parameter
      if (!punchlist_uuid) {
        throw new Error('Punchlist UUID is required for deletion');
      }
      
      const response = await httpService.sendDirectServiceRequest(
        `punchlist/${punchlist_uuid}/`,
        'DELETE',
        null,
        'product'
      );
      return response.data;
    },
    {
      onSuccess: async (data) => {
        if (displayAlert) {
          displayAlert('success', 'Punchlist item deleted successfully');
        }
        // Invalidate and refetch punchlist queries
        await queryClient.invalidateQueries(['productPunchlist', product_uuid]);
        console.log('useDeletePunchlistItemMutation: Item deleted successfully:', data);
      },
      onError: (error) => {
        console.error('useDeletePunchlistItemMutation: Error deleting item:', error);
        if (displayAlert) {
          displayAlert('error', 'Failed to delete punchlist item');
        }
      },
    }
  );
};
