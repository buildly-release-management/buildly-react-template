import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreatePunchlistMutation = (release_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createPunchlistData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.COLLABHUB_URL}punchlist/`,
        createPunchlistData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Punchlist created successfully');
        await queryClient.invalidateQueries({ queryKey: ['releaseBugsPunchList', release_uuid] });
        if (history) {
          history.push(redirectTo);
        }
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create punchlist!');
      },
    },
  );
};
