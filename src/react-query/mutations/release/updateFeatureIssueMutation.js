import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUpdateFeatureIssueMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data_array) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}release/update-status-column-order/`,
        { data_array },
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Feature(s) column and order updated successfully');
        await queryClient.invalidateQueries({ queryKey: ['allFeatures', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allIssues', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to update feature(s) column and order!');
      },
    },
  );
};
