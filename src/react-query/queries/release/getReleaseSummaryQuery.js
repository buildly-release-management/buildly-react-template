import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getReleaseSummaryQuery = async (release_uuid, product_uuid, displayAlert) => {
  try {
    const query = release_uuid ? `?release_uuid=${release_uuid}` : `?product_uuid=${product_uuid}`;
    const response = await httpService.makeRequest(
      'get',
      `${window.env.RELEASE_SERVICE_URL}release/release_summary/${query}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch release summary!");
    return {};
  }
};
