import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useDeleteStatusMutation = (history, redirectTo, product_uuid, discardFormData, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (deleteStatusData) => {
      const statuses = await Promise.all(
        _.map(deleteStatusData, (status_data) => (
          httpService.makeRequest(
            'delete',
            `${window.env.API_URL}release/status/${status_data.status_uuid}/`,
            status_data,
          )
        )),
      );
      const finalResponse = _.flatMap(_.map(statuses, 'data'));
      return finalResponse;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['allStatuses', product_uuid] });
        displayAlert('success', 'Status deleted successfully');
        discardFormData();
        if (history) {
          history.push(redirectTo);
        }
      },
    },
    {
      onError: () => {
        displayAlert('error', 'Unable to delete status!');
      },
    },
  );
};
