import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useValidateCredentialMutation = (displayAlert) => useMutation(
  async (validateCredentialData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}product/validate-credential/`,
      validateCredentialData,
    );
    return response;
  },
  {
    onSuccess: async (response) => {
      displayAlert('success', `${_.capitalize(response.data.message)}`);
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Invalid credentials!');
    },
  },
);
