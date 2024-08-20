import { httpService } from '@modules/http/http.service';

export const getBoardQuery = async (product_uuid, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}product/board-list/?product_uuid=${product_uuid}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch all board!");
    return [];
  }
};
