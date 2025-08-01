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
  // make a deep copy of the data and ensure both parameters are arrays
  const releaseDataCopy = JSON.parse(JSON.stringify(releaseData || []));
  const budgetDataSafe = Array.isArray(budgetData) ? budgetData : [];
  
  return releaseDataCopy.map((release) => {
    const releaseCopy = { ...release };
    const teamData = budgetDataSafe.find((budgetItem) => budgetItem.release === release.name);
    releaseCopy.team = teamData ? teamData?.team : [];

    // // add team.budget to get release total
    releaseCopy.totalCost = (teamData ? teamData.team.reduce((acc, curr) => acc + curr.budget, 0) : 0);
    return releaseCopy;
  });
};

export const addColorsAndIcons = (releaseData) => {
  const releaseDataCopy = [...releaseData];
  if (releaseDataCopy.length > 0) {
    return releaseDataCopy.map((item, index) => {
      const itemCopy = { ...item };
      let colors = ['#E0E0E0', '#F9943B', '#0C5594', '#152944'];
      
      // Handle real release data - use the actual status field and add null safety
      const status = (item.status || item.release_status || 'unknown').toLowerCase();
      const releaseName = (itemCopy.name || itemCopy.release_name || '').toLowerCase();
      
      if (releaseName.includes('poc')) {
        if (status === 'released' || status === 'completed') {
          itemCopy.icon = FaRegCalendarCheck;
        } else if (status === 'in_progress' || status === 'active') {
          itemCopy.icon = FaHubspot;
        } else {
          itemCopy.icon = FaQuestionCircle;
        }
      } else if (releaseName.includes('mvp')) {
        if (status === 'released' || status === 'completed') {
          itemCopy.icon = FaRegCalendarCheck;
        } else if (status === 'in_progress' || status === 'active') {
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
