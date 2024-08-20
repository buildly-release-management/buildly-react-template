import { httpService } from '@modules/http/http.service';

export const getProductReportQuery = async (product_uuid, displayAlert) => {
  try {
    const response = await httpService.sendDirectServiceRequest(
      `product/${product_uuid}/report/`,
      'GET',
      null,
      'product',
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't fetch product report!");
    return [];
  }
};
