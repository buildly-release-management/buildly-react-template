import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useDeleteFeatureMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (deleteFeatureData) => {
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}release/feature/${deleteFeatureData.feature_uuid}/`,
        deleteFeatureData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Feature deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['allFeatures', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to delete feature!');
      },
    },
  );
};
