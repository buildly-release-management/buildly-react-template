import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getPunchListQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.COLLABHUB_URL}punchlist/`,
    );
    const punchlists = response.data;
    return punchlists;
  } catch (error) {
    displayAlert('error', "Couldn't fetch punchlist(s) from collab hub!");
    return {};
  }
};
