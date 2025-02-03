import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getAllPunchListQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.COLLABHUB_URL}punchlist/`,
    );

    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch all punchlist from collab hub!");
    return {};
  }
};
