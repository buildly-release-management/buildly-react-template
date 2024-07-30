import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useResetPasswordMutation = (
  history,
  redirectTo,
  displayAlert,
) => useMutation(
  async (resetData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/reset_password_confirm/`,
      resetData,
    );
    return response.data;
  },
  {
    onSuccess: async (data) => {
      displayAlert('success', data.detail);
      history.push(redirectTo);
    },
    onError: () => {
      displayAlert('error', 'Password reset failed');
    },
  },
);
