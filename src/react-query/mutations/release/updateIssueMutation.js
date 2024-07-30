import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUpdateIssueMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updateIssueData) => {
      const response = await httpService.makeRequest(
        'put',
        `${window.env.API_URL}release/issue/${updateIssueData.issue_uuid}/`,
        updateIssueData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Issue updated successfully');
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allIssues', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to update issue!');
      },
    },
  );
};
