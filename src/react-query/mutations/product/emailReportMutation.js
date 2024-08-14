import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useEmailReportMutation = (product_uuid, displayAlert) => useMutation(
  async (emailReportData) => {
    const response = await httpService.sendDirectServiceRequest(
      `pdf_report/${product_uuid}/`,
      'GET',
      null,
      'product',
      false,
    );
    return response.data;
  },
  {
    onSuccess: async (data) => {
      displayAlert('success', 'Report successfully emailed!');
    },
  },
  {
    onError: () => {
      displayAlert('error', "Couldn't email the report");
    },
  },
);
