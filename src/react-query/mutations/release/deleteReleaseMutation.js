import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useDeleteReleaseMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (deleteReleaseData) => {
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.RELEASE_SERVICE_URL}release/${deleteReleaseData.release_uuid}/`,
        deleteReleaseData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Release deleted successfully');
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
        displayAlert('error', 'Unable to delete release!');
      },
    },
  );
};
