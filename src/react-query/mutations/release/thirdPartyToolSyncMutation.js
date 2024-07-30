import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const useThirdPartyToolSyncMutation = (displayAlert) => useMutation(
  async (thirdPartyToolSyncData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}release/third_party_tool_sync/`,
      thirdPartyToolSyncData,
    );
    let status = true;
    if (response && response.data) {
      _.forEach(response.data, (tool) => {
        status = status && !_.isEmpty(tool) && _.isEmpty(tool.details);
      });
    }
    return status;
  },
  {
    onSuccess: () => {
      displayAlert('success', 'Third party tool(s) data synced successfully');
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Couldn\'t sync third party tool(s) data!');
    },
  },
);
