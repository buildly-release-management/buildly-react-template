import { httpService } from '@modules/http/http.service';

export const getReleaseProductReportQuery = async (product_uuid, displayAlert) => {
  try {
    const response = await httpService.sendDirectServiceRequest(
      `product_report/${product_uuid}/`,
      'GET',
      null,
      'release',
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch release product report!");
    return [];
  }
};
