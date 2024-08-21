import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUpdateProductMutation = (organization, history, redirectTo, clearProductFormData, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updateProductData) => {
      const response = await httpService.makeRequest(
        'put',
        `${window.env.API_URL}product/product/${updateProductData.product_uuid}/`,
        updateProductData,
      );
      return response;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ['allProducts', organization] });
        displayAlert('success', 'Product updated successfully');
        if (clearProductFormData) {
          clearProductFormData();
        }
        if (history) {
          history.push(redirectTo);
        }
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create product!');
      },
    },
  );
};
