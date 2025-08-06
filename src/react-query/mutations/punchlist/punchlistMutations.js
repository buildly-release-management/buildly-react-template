import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreatePunchlistItemMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (punchlistData) => {
      console.log('useCreatePunchlistItemMutation: Creating punchlist item for product:', product_uuid);
      console.log('useCreatePunchlistItemMutation: Punchlist data:', punchlistData);
      
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/punchlist/`,
        { ...punchlistData, product_uuid },
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
      
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}product/punchlist/${punchlist_uuid}/update-status/`,
        { status, assigned_to, resolution_notes },
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
      
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}product/punchlist/${punchlist_uuid}/`,
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
