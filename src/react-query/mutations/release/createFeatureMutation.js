import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateFeatureMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createFeatureData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.RELEASE_SERVICE_URL}feature/`,
        createFeatureData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Feature created successfully');
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allFeatures', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create feature!');
      },
    },
  );
};
