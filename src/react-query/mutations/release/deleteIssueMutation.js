import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useDeleteIssueMutation = (product_uuid, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (deleteIssueData) => {
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}release/issue/${deleteIssueData.issue_uuid}/`,
        deleteIssueData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Issue deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['allIssues', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to delete issue!');
      },
    },
  );
};
