import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUpdateFeatureMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updateFeatureData) => {
      const response = await httpService.makeRequest(
        'put',
        `${window.env.API_URL}release/feature/${updateFeatureData.feature_uuid}/`,
        updateFeatureData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Feature updated successfully');
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allFeatures', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to update feature!');
      },
    },
  );
};
