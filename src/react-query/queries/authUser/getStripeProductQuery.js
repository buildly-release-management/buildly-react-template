import { httpService } from '@modules/http/http.service';

export const getStripeProductQuery = async () => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}subscription/stripe_products/`,
    );
    return response.data;
  } catch (error) {
    return [];
  }
};
