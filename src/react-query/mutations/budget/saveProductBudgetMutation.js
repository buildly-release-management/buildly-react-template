import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { devLog } from '@utils/devLogger';

export const useSaveProductBudgetMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (budgetData) => {
      try {
        // Try direct product service first
        const response = await httpService.sendDirectServiceRequest(
          `budget/by-product/${product_uuid}/`,
          'POST',
          budgetData,
          'product'
        );
        return response.data;
      } catch (error) {
        // Fallback to main API if direct service fails
        devLog.log('useSaveProductBudgetMutation: Direct service failed, trying main API...', error.response?.status);
        const response = await httpService.makeRequest(
          'post',
          `${window.env.API_URL}product/budget/by-product/${product_uuid}/`,
          budgetData,
        );
        return response.data;
      }
    },
    {
      onSuccess: async (data) => {
        if (displayAlert) {
          displayAlert('success', 'Budget saved successfully');
        }
        // Invalidate and refetch budget queries
        await queryClient.invalidateQueries(['productBudget', product_uuid]);
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
