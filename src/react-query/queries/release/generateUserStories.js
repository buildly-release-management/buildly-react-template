import { httpService } from '@modules/http/http.service';

export const generateUserStoriesQuery = async (userStoriesData, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}release/generate-user-stories/`,
      userStoriesData,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', 'Unable to generate user stories!');
    return {};
  }
};
