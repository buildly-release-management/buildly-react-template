import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useUpdateStatusMutation = (history, redirectTo, product_uuid, discardFormData, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (editStatusData) => {
      let finalResponse;
      if (_.size(editStatusData) > 1) {
        const statuses = await Promise.all(
          _.map(editStatusData, (status_data) => (
            httpService.makeRequest(
              'put',
              `${window.env.API_URL}release/status/${status_data.status_uuid}/`,
              status_data,
            )
          )),
        );
        finalResponse = _.flatMap(_.map(statuses, 'data'));
      } else {
        const status = await httpService.makeRequest(
          'put',
          `${window.env.API_URL}release/status/${editStatusData.status_uuid}`,
          editStatusData,
        );
        finalResponse = status.data;
      }
      return finalResponse;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['allStatuses', product_uuid] });
        displayAlert('success', 'Status updated successfully');
        discardFormData();
        if (history) {
          history.push(redirectTo);
        }
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to update status!');
      },
    },
  );
};
