import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateCommentMutation = (product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createCommentData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}release/comment/`,
        createCommentData,
      );
      if ('user_info' in createCommentData) {
        response.data.user_info = createCommentData.user_info;
      }
      return response.data;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Succesfully commented on the feature/issue');
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allComments', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create comment!');
      },
    },
  );
};
