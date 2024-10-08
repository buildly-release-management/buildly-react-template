import { useMutation } from 'react-query';
import moment from 'moment-timezone';
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
    onSuccess: async (response, variables, context) => {
      const timeDiff = moment().diff(moment(response.data.organization.create_date), 'minutes');
      if (timeDiff < 5) {
        displayAlert('success', `Your are the first person in the Organization ${variables.organization_name}.\nPlease verify the email address to access the platform.`);
      } else {
        displayAlert('success', 'Please verify the email address to access the platform.');
      }
      history.push(redirectTo);
    },
    onError: () => {
      displayAlert('error', 'Registration failed');
    },
  },
);
