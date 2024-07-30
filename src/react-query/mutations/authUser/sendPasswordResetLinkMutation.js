import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useSendPasswordResetLinkMutation = (displayAlert) => useMutation(
  async (resetLinkData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/reset_password/`,
      resetLinkData,
    );
    return response.data;
  },
  {
    onSuccess: async (data) => {
      if (data && data.count) {
        displayAlert('success', data.detail);
      } else {
        displayAlert('error', 'The email address entered does not exist');
      }
    },
    onError: () => {
      displayAlert('error', 'Password reset email could not be sent');
    },
  },
);
