import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateIssueMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createIssueData) => {
      let finalResponse;
      if (Array.isArray(createIssueData)) {
        const issues = await Promise.all(
          _.map(createIssueData, (issue_data) => (
            httpService.makeRequest(
              'post',
              `${window.env.API_URL}release/issue/`,
              issue_data,
            )
          )),
        );
        finalResponse = _.flatMap(_.map(issues, 'data'));
      } else {
        const issue = await httpService.makeRequest(
          'post',
          `${window.env.API_URL}release/issue/`,
          createIssueData,
        );
        finalResponse = issue.data;
      }
      return finalResponse;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Issue created successfully');
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allIssues', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create issue!');
      },
    },
  );
};
