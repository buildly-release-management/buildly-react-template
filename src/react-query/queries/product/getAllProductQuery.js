import { httpService } from '@modules/http/http.service';

export const getAllProductQuery = async (organization_uuid, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}product/product/?organization_uuid=${organization_uuid}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch all products!");
    return [];
  }
};
