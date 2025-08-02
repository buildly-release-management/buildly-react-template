import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getAllReleaseQuery = async (product_uuid, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.RELEASE_SERVICE_URL}release/?product_uuid=${product_uuid}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch all releases!");
    return [];
  }
};
