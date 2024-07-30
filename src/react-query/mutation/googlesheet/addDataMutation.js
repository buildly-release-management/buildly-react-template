import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useAddDataMutation = (history, redirectTo, displayAlert) => useMutation(
  async (data) => {
    await httpService.makeRequest(
      'post',
      `${window.env.FEEDBACK_SHEET}`,
      data,
    );
  },
  {
    onSuccess: async () => {
      displayAlert('success', 'Feedback submitted sucessfully');
      if (history) {
        history.push(redirectTo);
      }
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Error submitting form. Please try again!');
    },
  },
);
