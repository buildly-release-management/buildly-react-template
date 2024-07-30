import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useCreateStatusMutation = (history, redirectTo, product_uuid, discardFormData, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (createStatusData) => {
      let finalResponse;
      if (_.size(createStatusData) > 1) {
        const statuses = await Promise.all(
          _.map(createStatusData, (status_data) => (
            httpService.makeRequest(
              'post',
              `${window.env.API_URL}release/status/`,
              status_data,
            )
          )),
        );
        finalResponse = _.flatMap(_.map(statuses, 'data'));
      } else {
        const status = await httpService.makeRequest(
          'post',
          `${window.env.API_URL}release/status/`,
          createStatusData,
        );
        finalResponse = status.data;
      }
      return finalResponse;
    },
    {
      onSuccess: async () => {
        displayAlert('success', 'Status created successfully');
        discardFormData();
        if (history) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({ queryKey: ['allStatuses', product_uuid] });
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to create status!');
      },
    },
  );
};
