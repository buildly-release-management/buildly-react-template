import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useEmailReportMutation = (product_uuid, displayAlert) => useMutation(
  async (emailReportData) => {
    // Send email data to the backend for processing
    const response = await httpService.sendDirectServiceRequest(
      `pdf_report/${product_uuid}/`,
      'POST',
      emailReportData,
      'product',
      false,
    );
    return response.data;
  },
  {
    onSuccess: async (data) => {
      displayAlert('success', 'Report successfully emailed! Please check your inbox.');
    },
    onError: (error) => {
      console.error('Email report error:', error);
      displayAlert('error', "Couldn't email the report. Please try again or contact support.");
    },
  },
);
