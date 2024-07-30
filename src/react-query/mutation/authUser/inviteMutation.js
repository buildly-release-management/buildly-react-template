import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useInviteMutation = (clearEmails, displayAlert) => useMutation(
  async (inviteData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/invite/`,
      inviteData,
    );
    return response;
  },
  {
    onSuccess: async () => {
      displayAlert('success', 'Invitations sent successfully');
      clearEmails();
    },
    onError: () => {
      displayAlert('error', 'One or more email address is invalid');
    },
  },
);
