import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useVerifyEmailMutation = (history, redirectTo, displayAlert) => useMutation(
  async (data) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/verify_email/`,
      data,
    );
    if (response.data && response.data.success) {
      displayAlert('success', 'Email successfully verified.');
      history.push(redirectTo);
    } else {
      displayAlert('error', 'Invalid token.');
    }
    return response.data;
  },
  {
    onError: () => {
      displayAlert('error', 'Something doesn\'t seem right. Please check the link and try again.');
    },
  },
);
