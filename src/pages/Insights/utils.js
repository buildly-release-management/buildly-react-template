/**
 * Get release data for the budget cards
 * @param teamData
 * @param releases
 * @returns {*[]|*}
 */
import {
  FaRegCalendarCheck, FaCloudsmith, FaQuestionCircle, FaPlaneDeparture, FaHubspot,
} from 'react-icons/fa';

export const getReleaseBudgetData = (teamData, releases) => {
  if (releases) {
    return releases.map((release) => {
      const budgetDict = { ...release };
      const data = [];
      if (teamData) {
        if (release.name.toLowerCase()
          .includes('poc')) {
          teamData.forEach((team) => {
            if (team.role.toLowerCase() !== '') {
              data.push(
                {
                  title: team.role,
                  cost: +team.budget * +team.count,
                  count: team.count,
                },
              );
            }
          });
        } else if (release.name.toLowerCase()
          .includes('mvp')) {
          teamData.forEach((team) => {
            data.push(
              {
                title: team.role,
                cost: +team.budget * +team.count,
                count: team.count,
              },
            );
          });
        } else {
          teamData.forEach((team) => {
            const teamDict = {
              title: team.role,
              cost: +team.budget * +team.count,
              count: team.count,
            };
            if (release.features.length < 5 && team.count > 2) {
              teamDict.cost = +team.budget * (+team.count - 1);
              teamDict.count = +team.count - 1;
            }
            data.push(teamDict);
          });
        }
      }
      budgetDict.team = data;
      budgetDict.totalCost = data.map((x) => x.cost).reduce((prev, next) => prev + next);
      return budgetDict;
    });
  }
  return [];
};

export const addColorsAndIcons = (releaseData) => {
  const releaseDataCopy = [...releaseData];
  if (releaseDataCopy.length > 0) {
    return releaseDataCopy.map((item, index) => {
      const itemCopy = { ...item };
      let colors = ['#E0E0E0', '#F9943B', '#0C5594', '#152944'];
      const status = item.release_status.toLowerCase();
      if (itemCopy.name.toLowerCase().includes('poc')) {
        if (status === 'released') {
          itemCopy.icon = FaRegCalendarCheck;
        } else if (status === 'in_progress') {
          itemCopy.icon = FaHubspot;
        } else {
          itemCopy.icon = FaQuestionCircle;
        }
      } else if (itemCopy.name.toLowerCase().includes('mvp')) {
        if (status === 'released') {
          itemCopy.icon = FaRegCalendarCheck;
        } else if (status === 'in_progress') {
          itemCopy.icon = FaPlaneDeparture;
        } else {
          itemCopy.icon = FaQuestionCircle;
        }
      } else {
        itemCopy.icon = FaCloudsmith;
      }
      if (index + 1 > colors.length) {
        colors = [...colors, ...colors];
      }
      itemCopy.bgColor = colors[index];
      return itemCopy;
    });
  }
  return [];
};
