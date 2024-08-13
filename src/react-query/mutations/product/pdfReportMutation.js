import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const usePDFReportMutation = (product_uuid, displayAlert) => useMutation(
  async () => {
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
      displayAlert('success', 'PDF Report downloaded!');
    },
  },
  {
    onError: () => {
      displayAlert('error', "Couldn't download the PDF report");
    },
  },
);
