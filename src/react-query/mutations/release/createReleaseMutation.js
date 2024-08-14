import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateReleaseMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createReleaseData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}release/release/`,
        createReleaseData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Release created successfully');
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allReleases', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allFeatures', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allIssues', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['releaseSummary', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create release!');
      },
    },
  );
};
