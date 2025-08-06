import { httpService } from '@modules/http/http.service';

export const handleCardInput = (cardDetails) => {
  return httpService.makeRequest(
    'post',
    `${window.env.API_URL}subscription/`,
    cardDetails,
  );
};
