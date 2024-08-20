import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUpdateReleaseMutation = (release_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updateReleaseData) => {
      const response = await httpService.makeRequest(
        'put',
        `${window.env.RELEASE_SERVICE_URL}release/${release_uuid}/`,
        updateReleaseData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Release updated successfully');
        await queryClient.invalidateQueries({ queryKey: ['releaseSummary', release_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['releaseFeatures', release_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to update issue!');
      },
    },
  );
};
