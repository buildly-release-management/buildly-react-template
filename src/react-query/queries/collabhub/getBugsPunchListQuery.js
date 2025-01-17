import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getBugsPunchListQuery = async (product_uuid, release_version, displayAlert) => {
  try {
    const productResponse = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}product/product/${product_uuid}/`,
    );

    const issueToolOrgName = productResponse.data?.issue_tool_detail?.org_name || '';
    let bugs = [];
    let punchLists = [];

    if (issueToolOrgName) {
      const punchListResponse = await httpService.makeRequest(
        'get',
        `${window.env.COLLABHUB_URL}punchlist/`,
      );
      const bugsResponse = await httpService.makeRequest(
        'get',
        `${window.env.COLLABHUB_URL}bugs/`,
      );

      bugs = _.filter(bugsResponse.data, (bug) => _.includes(_.toLower(bug.url), _.toLower(issueToolOrgName)) && _.includes(_.toLower(bug.version), _.toLower(release_version)));

      const allowedPunchlist = _.uniq(_.without(_.map(bugs, 'punchlist'), null));
      punchLists = _.filter(punchListResponse.data, (pl) => _.includes(allowedPunchlist, pl.id));
    }
    return { punchLists, bugs };
  } catch (error) {
    displayAlert('error', "Couldn't fetch bugs and punchlist from collab hub!");
    return {};
  }
};
