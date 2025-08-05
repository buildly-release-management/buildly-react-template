import moment from 'moment-timezone';

/**
 * Product Status Calculation Utility
 * Calculates product status based on timeline, budget, and developer availability
 */

/**
 * Calculate overall product status
 * @param {Object} product - Product data
 * @param {Array} releases - Product releases
 * @param {Array} features - Product features
 * @param {Array} issues - Product issues
 * @param {Object} budget - Budget information
 * @param {Array} teamMembers - Available team members
 * @returns {Object} Status information
 */
export const calculateProductStatus = (product, releases = [], features = [], issues = [], budget = null, teamMembers = []) => {
  const statusData = {
    overall: 'green',
    timeline: 'green',
    budget: 'green',
    resources: 'green',
    score: 100,
    details: {
      timeline: {},
      budget: {},
      resources: {},
      features: {},
      releases: {}
    }
  };

  // 1. Timeline Analysis
  const timelineStatus = calculateTimelineStatus(product, releases, features);
  statusData.timeline = timelineStatus.status;
  statusData.details.timeline = timelineStatus.details;

  // 2. Budget Analysis
  const budgetStatus = calculateBudgetStatus(product, budget, releases);
  statusData.budget = budgetStatus.status;
  statusData.details.budget = budgetStatus.details;

  // 3. Resource/Developer Availability Analysis
  const resourceStatus = calculateResourceStatus(product, teamMembers, features, issues);
  statusData.resources = resourceStatus.status;
  statusData.details.resources = resourceStatus.details;

  // 4. Feature/Release Progress Analysis
  const progressStatus = calculateProgressStatus(releases, features, issues);
  statusData.details.features = progressStatus.features;
  statusData.details.issues = progressStatus.issues;
  statusData.details.releases = progressStatus.releases;

  // 5. Calculate overall score and status
  const scores = {
    timeline: getStatusScore(timelineStatus.status),
    budget: getStatusScore(budgetStatus.status),
    resources: getStatusScore(resourceStatus.status),
    progress: getStatusScore(progressStatus.status)
  };

  statusData.score = Math.round((scores.timeline + scores.budget + scores.resources + scores.progress) / 4);
  statusData.overall = getStatusFromScore(statusData.score);

  return statusData;
};

/**
 * Calculate timeline status based on project dates and release schedules
 */
export const calculateTimelineStatus = (product, releases = [], features = []) => {
  const now = moment();
  const startDate = product?.product_info?.start_date ? moment(product.product_info.start_date) : null;
  const endDate = product?.product_info?.end_date ? moment(product.product_info.end_date) : null;
  
  let status = 'green';
  let urgency = 'low';
  let daysRemaining = null;
  let progressPercentage = 0;
  let delayedReleases = 0;

  const details = {
    hasTimeline: !!(startDate && endDate),
    startDate: startDate?.format('YYYY-MM-DD'),
    endDate: endDate?.format('YYYY-MM-DD'),
    daysRemaining: null,
    progressPercentage: 0,
    delayedReleases: 0,
    overdueTasks: 0,
    urgency: 'low'
  };

  if (startDate && endDate) {
    const totalDays = endDate.diff(startDate, 'days');
    const elapsedDays = now.diff(startDate, 'days');
    progressPercentage = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    daysRemaining = endDate.diff(now, 'days');

    details.daysRemaining = daysRemaining;
    details.progressPercentage = Math.round(progressPercentage);

    // Timeline status logic
    if (daysRemaining < 0) {
      status = 'red';
      urgency = 'critical';
    } else if (daysRemaining <= 7) {
      status = 'red';
      urgency = 'high';
    } else if (daysRemaining <= 30) {
      status = 'yellow';
      urgency = 'medium';
    } else if (progressPercentage > 80 && daysRemaining < totalDays * 0.2) {
      status = 'yellow';
      urgency = 'medium';
    }
  }

  // Check for delayed releases
  if (releases && releases.length > 0) {
    delayedReleases = releases.filter(release => {
      const releaseDate = release.target_date ? moment(release.target_date) : null;
      return releaseDate && releaseDate.isBefore(now) && release.status !== 'completed';
    }).length;

    details.delayedReleases = delayedReleases;

    if (delayedReleases > 0) {
      status = status === 'green' ? 'yellow' : status;
      if (delayedReleases >= 2) {
        status = 'red';
        urgency = 'high';
      }
    }
  }

  // Check for overdue features
  if (features && features.length > 0) {
    const overdueTasks = features.filter(feature => {
      const dueDate = feature.end_date ? moment(feature.end_date) : null;
      return dueDate && dueDate.isBefore(now) && feature.status !== 'completed';
    }).length;

    details.overdueTasks = overdueTasks;

    if (overdueTasks > 0) {
      status = status === 'green' ? 'yellow' : status;
      if (overdueTasks >= 3) {
        status = 'red';
      }
    }
  }

  details.urgency = urgency;

  return { status, details };
};

/**
 * Calculate budget status based on estimated vs actual costs
 */
export const calculateBudgetStatus = (product, budget = null, releases = []) => {
  let status = 'green';
  let overrunPercentage = 0;
  let remainingBudget = 0;
  let burnRate = 0;

  const details = {
    hasBudget: !!budget,
    totalBudget: budget?.total_budget || 0,
    spentBudget: budget?.spent_budget || 0,
    remainingBudget: 0,
    overrunPercentage: 0,
    burnRate: 0,
    projectedOverrun: false,
    budgetUtilization: 0
  };

  if (budget && budget.total_budget > 0) {
    const totalBudget = budget.total_budget;
    const spentBudget = budget.spent_budget || 0;
    remainingBudget = totalBudget - spentBudget;
    const budgetUtilization = (spentBudget / totalBudget) * 100;

    details.remainingBudget = remainingBudget;
    details.budgetUtilization = Math.round(budgetUtilization);

    // Calculate overrun if spent exceeds budget
    if (spentBudget > totalBudget) {
      overrunPercentage = ((spentBudget - totalBudget) / totalBudget) * 100;
      details.overrunPercentage = Math.round(overrunPercentage);

      if (overrunPercentage > 20) {
        status = 'red';
      } else if (overrunPercentage > 10) {
        status = 'yellow';
      }
    } else {
      // Check for projected overrun based on current burn rate
      if (budgetUtilization > 90) {
        status = 'red';
      } else if (budgetUtilization > 75) {
        status = 'yellow';
      }
    }

    // Calculate burn rate if we have release data
    if (releases && releases.length > 0) {
      const activeRelease = releases.find(r => r.status === 'active') || releases[0];
      if (activeRelease && activeRelease.team) {
        const weeklyTeamCost = activeRelease.team.reduce((sum, member) => 
          sum + ((member.count || 1) * (member.weeklyRate || 2500)), 0);
        burnRate = weeklyTeamCost;
        details.burnRate = burnRate;

        // Project if we'll go over budget
        const weeksRemaining = activeRelease.duration?.weeks || 12;
        const projectedSpend = spentBudget + (burnRate * weeksRemaining);
        if (projectedSpend > totalBudget) {
          details.projectedOverrun = true;
          status = status === 'green' ? 'yellow' : status;
        }
      }
    }
  }

  return { status, details };
};

/**
 * Calculate resource/developer availability status
 */
export const calculateResourceStatus = (product, teamMembers = [], features = [], issues = []) => {
  let status = 'green';
  
  const details = {
    totalTeamMembers: teamMembers.length,
    activeTeamMembers: teamMembers.filter(m => m.is_active).length,
    pendingTasks: 0,
    workloadDistribution: 'balanced',
    skillsCoverage: 'adequate',
    bottlenecks: []
  };

  // Count pending work
  const pendingFeatures = features.filter(f => f.status !== 'completed' && f.status !== 'done').length;
  const pendingIssues = issues.filter(i => i.status !== 'completed' && i.status !== 'done').length;
  details.pendingTasks = pendingFeatures + pendingIssues;

  // Team availability analysis
  if (details.activeTeamMembers === 0) {
    status = 'red';
    details.bottlenecks.push('No active team members assigned');
  } else if (details.activeTeamMembers < 2) {
    status = 'yellow';
    details.bottlenecks.push('Limited team size');
  }

  // Workload analysis
  if (details.activeTeamMembers > 0) {
    const tasksPerMember = details.pendingTasks / details.activeTeamMembers;
    if (tasksPerMember > 10) {
      status = 'red';
      details.workloadDistribution = 'overloaded';
      details.bottlenecks.push('Team overloaded');
    } else if (tasksPerMember > 5) {
      status = status === 'green' ? 'yellow' : status;
      details.workloadDistribution = 'high';
    }
  }

  // Skills coverage (simplified - could be enhanced with actual skill data)
  const requiredRoles = ['Frontend Developer', 'Backend Developer', 'QA Engineer'];
  const availableRoles = teamMembers.map(m => m.role || 'Developer');
  const missingRoles = requiredRoles.filter(role => 
    !availableRoles.some(available => available.toLowerCase().includes(role.toLowerCase().split(' ')[0]))
  );

  if (missingRoles.length > 1) {
    status = 'red';
    details.skillsCoverage = 'inadequate';
    details.bottlenecks.push(`Missing roles: ${missingRoles.join(', ')}`);
  } else if (missingRoles.length === 1) {
    status = status === 'green' ? 'yellow' : status;
    details.skillsCoverage = 'limited';
  }

  return { status, details };
};

/**
 * Calculate progress status based on features and releases completion
 */
export const calculateProgressStatus = (releases = [], features = [], issues = []) => {
  const featuresData = {
    total: features.length,
    completed: features.filter(f => f.status === 'completed' || f.status === 'done').length,
    inProgress: features.filter(f => f.status === 'in_progress' || f.status === 'doing').length,
    blocked: features.filter(f => f.status === 'blocked').length
  };

  const issuesData = {
    total: issues.length,
    completed: issues.filter(i => i.status === 'completed' || i.status === 'done').length,
    inProgress: issues.filter(i => i.status === 'in_progress' || i.status === 'doing').length,
    blocked: issues.filter(i => i.status === 'blocked').length
  };

  const releasesData = {
    total: releases.length,
    completed: releases.filter(r => r.status === 'completed').length,
    active: releases.filter(r => r.status === 'active' || r.status === 'in_progress').length,
    planned: releases.filter(r => r.status === 'planned').length
  };

  // Calculate progress percentages
  featuresData.completionRate = featuresData.total > 0 ? 
    Math.round((featuresData.completed / featuresData.total) * 100) : 0;
  
  issuesData.completionRate = issuesData.total > 0 ? 
    Math.round((issuesData.completed / issuesData.total) * 100) : 0;

  releasesData.completionRate = releasesData.total > 0 ? 
    Math.round((releasesData.completed / releasesData.total) * 100) : 0;

  // Determine overall progress status
  let status = 'green';
  const avgCompletion = (featuresData.completionRate + issuesData.completionRate) / 2;

  if (avgCompletion < 30) {
    status = 'red';
  } else if (avgCompletion < 60) {
    status = 'yellow';
  }

  // Check for blocked items
  if (featuresData.blocked > 0 || issuesData.blocked > 0) {
    status = status === 'green' ? 'yellow' : status;
  }

  return {
    status,
    features: featuresData,
    issues: issuesData,
    releases: releasesData
  };
};

/**
 * Helper function to convert status to numerical score
 */
const getStatusScore = (status) => {
  switch (status) {
    case 'green': return 100;
    case 'yellow': return 65;
    case 'red': return 30;
    default: return 80;
  }
};

/**
 * Helper function to convert score to status
 */
const getStatusFromScore = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};

/**
 * Get status color for UI components
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'green': return '#4caf50';
    case 'yellow': return '#ff9800';
    case 'red': return '#f44336';
    default: return '#9e9e9e';
  }
};

/**
 * Get status label for display
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case 'green': return 'Healthy';
    case 'yellow': return 'At Risk';
    case 'red': return 'Critical';
    default: return 'Unknown';
  }
};

/**
 * Generate status report for insights
 */
export const generateStatusReport = (product, statusData) => {
  return {
    product_name: product?.name || 'Unknown Product',
    overall_status: statusData.overall,
    overall_score: statusData.score,
    timeline_status: statusData.timeline,
    budget_status: statusData.budget,
    resources_status: statusData.resources,
    timeline_details: statusData.details.timeline,
    budget_details: statusData.details.budget,
    resources_details: statusData.details.resources,
    features_progress: statusData.details.features,
    releases_progress: statusData.details.releases,
    recommendations: generateRecommendations(statusData),
    generated_at: moment().toISOString()
  };
};

/**
 * Generate recommendations based on status
 */
const generateRecommendations = (statusData) => {
  const recommendations = [];

  // Timeline recommendations
  if (statusData.timeline === 'red') {
    if (statusData.details.timeline.daysRemaining < 0) {
      recommendations.push('🚨 Project is overdue. Immediate action required to reassess timeline and deliverables.');
    } else if (statusData.details.timeline.delayedReleases > 0) {
      recommendations.push('⏰ Multiple releases are delayed. Consider reprioritizing features or extending timelines.');
    }
  } else if (statusData.timeline === 'yellow') {
    recommendations.push('⚠️ Timeline is at risk. Monitor progress closely and consider resource reallocation.');
  }

  // Budget recommendations
  if (statusData.budget === 'red') {
    if (statusData.details.budget.overrunPercentage > 0) {
      recommendations.push(`💰 Budget overrun detected (${statusData.details.budget.overrunPercentage}%). Review scope and costs immediately.`);
    } else if (statusData.details.budget.budgetUtilization > 90) {
      recommendations.push('💸 Budget nearly exhausted. Implement strict cost controls.');
    }
  } else if (statusData.budget === 'yellow') {
    recommendations.push('💳 Budget utilization is high. Monitor spending and consider cost optimization.');
  }

  // Resource recommendations
  if (statusData.resources === 'red') {
    if (statusData.details.resources.activeTeamMembers === 0) {
      recommendations.push('👥 No active team members assigned. Assign developers immediately.');
    } else if (statusData.details.resources.workloadDistribution === 'overloaded') {
      recommendations.push('🔥 Team is overloaded. Consider hiring additional developers or reducing scope.');
    }
  } else if (statusData.resources === 'yellow') {
    recommendations.push('⚖️ Team capacity is at risk. Monitor workload distribution and consider scaling.');
  }

  // General recommendations
  if (statusData.score < 60) {
    recommendations.push('🎯 Overall project health is concerning. Schedule immediate stakeholder review.');
  } else if (statusData.score < 80) {
    recommendations.push('📊 Project needs attention in multiple areas. Implement monitoring and improvement plan.');
  }

  return recommendations;
};

export default {
  calculateProductStatus,
  calculateTimelineStatus,
  calculateBudgetStatus,
  calculateResourceStatus,
  calculateProgressStatus,
  getStatusColor,
  getStatusLabel,
  generateStatusReport,
  generateRecommendations
};
