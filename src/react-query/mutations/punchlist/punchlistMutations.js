import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreatePunchlistItemMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (punchlistData) => {
      console.log('useCreatePunchlistItemMutation: Creating punchlist item for product:', product_uuid);
      console.log('useCreatePunchlistItemMutation: Punchlist data:', punchlistData);
      
      // Map frontend fields to API expected fields
      const apiPayload = {
        product_uuid: punchlistData.product_uuid || product_uuid,
        reporter_name: punchlistData.reporter_name,
        reporter_email: punchlistData.reporter_email,
        application_name: punchlistData.application_name || 'Web Application', // Default if not provided
        version: punchlistData.version || '1.0.0', // Default if not provided
        issue_title: punchlistData.title, // Map title to issue_title
        description: punchlistData.description,
        expected_behavior: punchlistData.expected_behavior,
        // Optional fields
        severity: punchlistData.severity,
        priority: punchlistData.priority,
        steps_to_reproduce: punchlistData.steps_to_reproduce,
        actual_behavior: punchlistData.actual_behavior,
        environment: punchlistData.environment,
        browser_version: punchlistData.browser_version,
        screenshots: punchlistData.screenshots,
        assigned_to: punchlistData.assigned_to,
        tags: punchlistData.tags,
        release_uuid: punchlistData.release_uuid,
        date_created: punchlistData.date_created,
        status: punchlistData.status
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
      
      const response = await httpService.sendDirectServiceRequest(
        `punchlist/${punchlist_uuid}/update-status/`,
        'PATCH',
        { status, assigned_to, resolution_notes },
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
