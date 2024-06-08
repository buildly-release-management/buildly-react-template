/**
 * Get release data for the budget cards
 * @param teamData
 * @param releases
 * @returns {*[]|*}
 */
import {
  FaRegCalendarCheck, FaCloudsmith, FaQuestionCircle, FaPlaneDeparture, FaHubspot,
} from 'react-icons/fa';

export const getReleaseBudgetData = (budgetData, releaseData) => {
  // make a deep copy of the data
  const releaseDataCopy = JSON.parse(JSON.stringify(releaseData || []));
  return releaseDataCopy.map((release) => {
    const releaseCopy = { ...release };
    const teamData = budgetData.find((budgetItem) => budgetItem.release === release.name);
    releaseCopy.team = teamData ? teamData?.team : [];

    // // add team.budget to get release total
    releaseCopy.totalCost = (teamData ? teamData.team.reduce((acc, curr) => acc + curr.budget, 0) : 0);
    console.log('releaseCopy', releaseCopy);
    return releaseCopy;
  });
};

export const addColorsAndIcons = (releaseData) => {
  const releaseDataCopy = [...releaseData];
  if (releaseDataCopy.length > 0) {
    return releaseDataCopy.map((item, index) => {
      const itemCopy = { ...item };
      let colors = ['#E0E0E0', '#F9943B', '#0C5594', '#152944'];
      const status = item.release_status.toLowerCase();
      if (itemCopy.name.toLowerCase()
        .includes('poc')) {
        if (status === 'released') {
          itemCopy.icon = FaRegCalendarCheck;
        } else if (status === 'in_progress') {
          itemCopy.icon = FaHubspot;
        } else {
          itemCopy.icon = FaQuestionCircle;
        }
      } else if (itemCopy.name.toLowerCase()
        .includes('mvp')) {
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
