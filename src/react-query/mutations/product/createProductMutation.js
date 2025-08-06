import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { devLog } from '@utils/devLogger';
import { useStore } from '@zustand/product/productStore';

export const useCreateProductMutation = (organization, history, redirectTo, clearProductFormData, displayAlert) => {
  const queryClient = useQueryClient();
  const { setActiveProduct } = useStore();

  return useMutation(
    async (createProductData) => {
      devLog.log('useCreateProductMutation: Creating product with data:', createProductData);
      const response = await httpService.makeRequest(
        'post',
        `product/by-org/${organizationUuid}/`,
        createProductData
      );
      devLog.log('useCreateProductMutation: Product created successfully:', response);
      return response;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ['allProducts', organization] });
        clearProductFormData();
        displayAlert('success', 'Product created successfully');
        if (history) {
          setActiveProduct(data.data.product_uuid);
          history.push(redirectTo, { selected_product: data.data.product_uuid });
        }
      },
      onError: (error) => {
        console.error('useCreateProductMutation: Error creating product:', error);
        console.error('useCreateProductMutation: Error response:', error.response?.data);
        let errorMessage = 'Unable to create product!';
        
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
