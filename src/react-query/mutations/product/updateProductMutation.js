import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUpdateProductMutation = (organization, history, redirectTo, clearProductFormData, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updateProductData) => {
      console.log('useUpdateProductMutation: Updating product with data:', updateProductData);
      const response = await httpService.makeRequest(
        'put',
        `${window.env.API_URL}product/product/${updateProductData.product_uuid}/`,
        updateProductData,
      );
      console.log('useUpdateProductMutation: Product updated successfully:', response);
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
      onError: (error) => {
        console.error('useUpdateProductMutation: Error updating product:', error);
        console.error('useUpdateProductMutation: Error response:', error.response?.data);
        let errorMessage = 'Unable to update product!';
        
        // Handle specific API errors
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        displayAlert('error', errorMessage);
      },
    },
  );
};
