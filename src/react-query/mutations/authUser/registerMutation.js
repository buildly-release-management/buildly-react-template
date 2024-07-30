import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useRegisterMutation = (
  history,
  redirectTo,
  displayAlert,
) => useMutation(
  async (registerData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/`,
      registerData,
    );
    return response;
  },
  {
    onSuccess: async () => {
      displayAlert('success', 'Please verify the email address to access the platform.');
      history.push(redirectTo);
    },
    onError: () => {
      displayAlert('error', 'Registration failed');
    },
  },
);
