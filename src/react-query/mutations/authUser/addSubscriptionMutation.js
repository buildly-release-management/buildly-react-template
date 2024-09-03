import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';
import _ from 'lodash';

export const useAddSubscriptionMutation = (displayAlert, history, redirectTo) => useMutation(
  async (data) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}subscription/`,
      data,
    );
    const user = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/me/`,
    );
    oauthService.setOauthUser(user);
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    oauthService.setCurrentCoreUser(coreuser, user);
    if (user && user.data && user.data.organization) {
      await httpService.makeRequest(
        'get',
        `${window.env.API_URL}organization/${user.data.organization.organization_uuid}/`,
        null,
        true,
      );
    }
    return response.data;
  },
  {
    onSuccess: () => {
      displayAlert('success', 'Subscription successfully saved');
      if (redirectTo) {
        history.push(redirectTo);
      }
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Couldn\'t save subscription!');
    },
  },
);
