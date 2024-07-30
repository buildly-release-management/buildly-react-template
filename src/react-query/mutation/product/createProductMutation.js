import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useCreateProductMutation = (organization, history, redirectTo, clearProductFormData, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createProductData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/product/`,
        createProductData,
      );
      return response;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ['allProducts', organization] });
        clearProductFormData();
        displayAlert('success', 'Product created successfully');
        if (history) {
          localStorage.setItem('activeProduct', data.data.product_uuid);
          history.push(redirectTo, { selected_product: data.data.product_uuid });
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
