import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';
import { providers } from '@utils/socialLogin';

export const useSocialLoginMutation = (
  history,
  missingRedirectTo,
  roadmapRedirectTo,
  displayAlert,
) => useMutation(
  async (socialLoginData) => {
    let url;
    switch (socialLoginData.provider) {
      case providers.github:
        url = `${window.env.API_URL}oauth/complete/github/?code=${socialLoginData.code}`;
        break;
      default:
        break;
    }
    const token = await httpService.makeRequest(
      'get',
      url,
    );
    oauthService.setAccessToken(token.data);
    const user = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/me/`,
    );
    oauthService.setOauthUser(user, { socialLoginData });
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    oauthService.setCurrentCoreUser(coreuser, user);
    return user;
  },
  {
    onSuccess: async (data) => {
      if (!data.data.email || !data.data.organization || !data.data.user_type) {
        history.push(missingRedirectTo);
      } else {
        history.push(roadmapRedirectTo);
      }
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Social sign in failed');
    },
  },
);
