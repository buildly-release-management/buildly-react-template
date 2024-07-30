import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getAllCommentQuery = async (product_uuid, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}release/comment/?product_uuid=${product_uuid}`,
    );
    let commentWithUserInfo;
    if (_.some(response?.data, (ele) => ele.user_signoff_uuid !== null)) {
      const users = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}coreuser/`,
      );
      commentWithUserInfo = _.map(response.data, (comment) => ({
        ...comment,
        user_info: _.find(users.data, {
          core_user_uuid: comment.user_signoff_uuid,
        }),
      }));
    }
    return _.orderBy(!_.isEmpty(commentWithUserInfo) ? commentWithUserInfo : response.data, 'create_date', 'asc');
  } catch (error) {
    displayAlert('error', "Couldn't fetch all comments!");
    return [];
  }
};
