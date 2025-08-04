import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useSaveProductBudgetMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (budgetData) => {
      console.log('useSaveProductBudgetMutation: Saving budget for product:', product_uuid);
      console.log('useSaveProductBudgetMutation: Budget data:', budgetData);
      
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/budget/by-product/${product_uuid}/`,
        budgetData,
      );
      return response.data;
    },
    {
      onSuccess: async (data) => {
        if (displayAlert) {
          displayAlert('success', 'Budget saved successfully');
        }
        // Invalidate and refetch budget queries
        await queryClient.invalidateQueries(['productBudget', product_uuid]);
        console.log('useSaveProductBudgetMutation: Budget saved successfully:', data);
      },
      onError: (error) => {
        console.error('useSaveProductBudgetMutation: Error saving budget:', error);
        if (displayAlert) {
          displayAlert('error', 'Failed to save budget');
        }
      },
    }
  );
};
