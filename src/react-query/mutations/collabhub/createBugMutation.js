import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateBugMutation = (release_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createBugData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.COLLABHUB_URL}bugs/`,
        createBugData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Bug created successfully');
        await queryClient.invalidateQueries({ queryKey: ['releaseBugsPunchList', release_uuid] });
        if (history) {
          history.push(redirectTo);
        }
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create bug!');
      },
    },
  );
};
