import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateBoardMutation = (organization, product_uuid, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (multipleData) => {
      const { formData, newStatusData } = multipleData;
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/board-configuration/?product_uuid=${product_uuid}`,
        formData,
      );
      if (response && response.data) {
        if (!_.isEmpty(newStatusData)) {
          if (_.size(newStatusData) > 1) {
            const statuses = await Promise.all(
              _.map(newStatusData, (status_data) => (
                httpService.makeRequest(
                  'post',
                  `${window.env.API_URL}release/status/`,
                  status_data,
                )
              )),
            );
          } else {
            const status = await httpService.makeRequest(
              'post',
              `${window.env.API_URL}release/status/`,
              newStatusData,
            );
          }
        }
      }
      return response;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ['board', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allStatuses', product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allProducts', organization] });
        displayAlert('success', 'Product Board and Statuses created successfully');
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
