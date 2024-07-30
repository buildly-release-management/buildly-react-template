import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useDeleteProductMutation = (organization, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (deleteProductData) => {
      await httpService.makeRequest(
        'post',
        `${window.env.API_URL}release/clear-product-data/`,
        deleteProductData,
      );
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}product/product/${deleteProductData.product_uuid}`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['allProducts', organization] });
        displayAlert('success', 'Product cleared and deleted successfully');
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to clear or delete product!');
      },
    },
  );
};
