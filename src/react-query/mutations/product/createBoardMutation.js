import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateBoardMutation = (history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createBoardData, statusData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}product/board-configuration/?product_uuid=${createBoardData.product_uuid}`,
        createBoardData,
      );
      if (response && response.data) {
        if (!_.isEmpty(statusData)) {
          if (_.size(statusData) > 1) {
            const statuses = await Promise.all(
              _.map(statusData, (status_data) => (
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
              statusData,
            );
          }
        }
      }
      return response;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ['board', data.product_uuid] });
        await queryClient.invalidateQueries({ queryKey: ['allStatuses', data.product_uuid] });
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
