import { httpService } from '@modules/http/http.service';

export const submitCardDetails = async (cardDetails) => {
  console.log('cardDetails', cardDetails);
  return httpService.makeRequest(
    'post',
    `${window.env.API_URL}subscription/`,
    cardDetails,
  );
};
