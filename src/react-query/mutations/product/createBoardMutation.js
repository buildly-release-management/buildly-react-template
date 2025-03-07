import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateBoardMutation = (organization, product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (formData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/board-configuration/?product_uuid=${product_uuid}`,
        formData,
      );
      return response;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ['board', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allProducts', organization] });
        displayAlert('success', 'Product Board created successfully');
        if (history) {
          history.push(redirectTo);
        }
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create product board and statuses!');
      },
    },
  );
};
