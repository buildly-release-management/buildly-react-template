import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getReleaseFeaturesIssuesQuery = async (release_uuid, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}release/feature/?release_features__release_uuid=${release_uuid}`,
    );
    const features = response.data;
    if (!_.isEmpty(features)) {
      const featureResponses = await Promise.all(
        _.forEach(features, async (feature, index) => {
          const issuesResponse = await httpService.makeRequest(
            'get',
            `${window.env.API_URL}release/issue/?feature=${feature.feature_uuid}`,
          );
          if (issuesResponse.data) {
            features[index].issuesList = issuesResponse.data;
          }
        }),
      );
    }
    return features;
  } catch (error) {
    displayAlert('error', "Couldn't fetch release features and issues!");
    return {};
  }
};
