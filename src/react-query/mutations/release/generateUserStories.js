import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useGenerateUserStoriesMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (user_types, user_profiles, feature_uuid) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}release/generate-user-stories/`,
        { user_types, user_profiles, feature_uuid },
      );
      return response.data;
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to generate user stories!');
      },
    },
  );
};
