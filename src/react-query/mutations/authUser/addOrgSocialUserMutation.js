import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';
import _ from 'lodash';

export const useAddOrgSocialUserMutation = (
  history,
  existingOrg,
  loginRedirectTo,
  roadmapRedirectTo,
  displayAlert,
) => useMutation(
  async (data) => {
    const user = await httpService.makeRequest(
      'patch',
      `${window.env.API_URL}coreuser/update_org/${data.id}/`,
      data,
    );
    oauthService.setOauthUser(user, { data });
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    oauthService.setCurrentCoreUser(coreuser, user);
    if (existingOrg) {
      history.push(loginRedirectTo);
      displayAlert('success', `Added to Org ${_.capitalize(user.data.organization.name)}. You need to be approved by Org. Admin to access the platform.`);
    } else if (!existingOrg && data.organization_name !== 'default organization') {
      history.push(roadmapRedirectTo);
      displayAlert('success', `Created new Org ${_.capitalize(user.data.organization.name)} with you as Admin.`);
    }
  },
  {
    onError: () => {
      displayAlert('error', 'Unable to update user details');
    },
  },
);
