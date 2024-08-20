import { httpService } from '@modules/http/http.service';

export const getAllThirdPartyToolQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}product/thirdpartytool/`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch all third party tools!");
    return [];
  }
};
