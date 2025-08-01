/**
 * Get release data for the budget cards
 * @param teamData
 * @param releases
 * @returns {*[]|*}
 */
import {
  FaRegCalendarCheck, FaCloudsmith, FaQuestionCircle, FaPlaneDeparture, FaHubspot,
} from 'react-icons/fa';

/**
 * Estimate feature completion dates using AI
 * @param {Array} features - Array of features
 * @param {string} releaseDate - Target release date
 * @returns {Promise<Array>} - Features with estimated completion dates
 */
export const estimateFeatureCompletionDates = async (features, releaseDate) => {
  if (!features || features.length === 0) {
    return features;
  }

  // For now, let's use a simple algorithm. Later we can enhance with AI
  const targetDate = new Date(releaseDate || Date.now());
  const currentDate = new Date();
  const timeToRelease = targetDate.getTime() - currentDate.getTime();
  const daysToRelease = Math.max(1, Math.floor(timeToRelease / (1000 * 60 * 60 * 24)));

  return features.map((feature, index) => {
    if (feature.estimated_completion_date) {
      return feature; // Already has completion date
    }

    // Distribute features evenly leading up to release
    const featureProgress = (index + 1) / features.length;
    const daysFromNow = Math.floor(daysToRelease * featureProgress * 0.8); // Complete 80% before release
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysFromNow);

    return {
      ...feature,
      estimated_completion_date: estimatedDate.toISOString().split('T')[0],
      estimation_source: 'auto' // Mark as auto-generated
    };
  });
};

/**
 * Use AI to generate more sophisticated completion date estimates
 * @param {Array} features - Array of features
 * @param {string} releaseDate - Target release date
 * @param {Object} productContext - Product information for AI context
 * @returns {Promise<Array>} - Features with AI-estimated completion dates
 */
export const generateAIFeatureEstimates = async (features, releaseDate, productContext) => {
  if (!features || features.length === 0) {
    return features;
  }

  // Check if BabbleBeaver is available
  const apiUrl = window.env?.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api/chat'
    : `${window.env.API_URL}ai/chat/`;

  try {
    const featuresWithoutDates = features.filter(f => !f.estimated_completion_date);
    
    if (featuresWithoutDates.length === 0) {
      return features; // All features already have dates
    }

    const prompt = `
You are a project management AI assistant. Given the following product context and features, estimate realistic completion dates for each feature.

Product Context:
- Product: ${productContext?.name || 'Unknown Product'}
- Architecture: ${productContext?.architecture_type || 'Unknown'}
- Target Release Date: ${releaseDate}
- Total Features: ${features.length}

Features to estimate:
${featuresWithoutDates.map((f, i) => `${i + 1}. ${f.name || f.feature_name}: ${f.description || 'No description'}`).join('\n')}

Please provide completion date estimates in YYYY-MM-DD format, considering:
1. Feature complexity and dependencies
2. Time until target release date
3. Realistic development timeline
4. Buffer time for testing and refinement

Respond with a JSON array of objects with "index" (0-based) and "estimated_completion_date" fields.
`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        context: 'project_management'
      })
    });

    if (response.ok) {
      const data = await response.json();
      const estimates = JSON.parse(data.response || '[]');
      
      // Apply AI estimates to features
      const updatedFeatures = [...features];
      estimates.forEach(estimate => {
        const featureIndex = featuresWithoutDates.findIndex((_, i) => i === estimate.index);
        if (featureIndex !== -1) {
          const originalIndex = features.findIndex(f => f === featuresWithoutDates[featureIndex]);
          if (originalIndex !== -1) {
            updatedFeatures[originalIndex] = {
              ...updatedFeatures[originalIndex],
              estimated_completion_date: estimate.estimated_completion_date,
              estimation_source: 'ai'
            };
          }
        }
      });

      return updatedFeatures;
    }
  } catch (error) {
    console.log('AI estimation failed, using fallback:', error);
  }

  // Fallback to simple estimation
  return estimateFeatureCompletionDates(features, releaseDate);
};

/**
 * Generate AI-powered budget and team size estimates
 * @param {Object} release - Release data with features
 * @param {Object} productContext - Product information
 * @param {Object} teamPreferences - User's team preferences
 * @returns {Promise<Object>} - Budget and team recommendations
 */
export const generateAIBudgetEstimate = async (release, productContext, teamPreferences = {}) => {
  const apiUrl = window.env?.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api/chat'
    : `${window.env.API_URL}ai/chat/`;

  try {
    const prompt = `
You are a project management and budgeting AI assistant. Estimate realistic budget and team size for this release.

Product Context:
- Product: ${productContext?.name || 'Unknown Product'}
- Architecture: ${productContext?.architecture_type || 'microservice'}
- Timeline: ${release.release_date}

Release Details:
- Release: ${release.name}
- Features: ${release.features?.length || 0}
- Issues: ${release.issues?.length || 0}

Feature Details:
${release.features?.map((f, i) => `${i + 1}. ${f.name || f.feature_name}: ${f.description || 'No description'}`).join('\n') || 'No features listed'}

Team Preferences:
${Object.keys(teamPreferences).length > 0 ? 
  Object.entries(teamPreferences).map(([role, count]) => `- ${role}: ${count}`).join('\n') :
  '- No specific team preferences specified'
}

Please provide:
1. Recommended team composition (roles and counts)
2. Estimated timeline in weeks
3. Budget estimate (total and per team member)
4. Risk factors and buffers

Respond with JSON format:
{
  "team": [
    {"role": "Frontend Developer", "count": 2, "weeklyRate": 2500},
    {"role": "Backend Developer", "count": 1, "weeklyRate": 2800}
  ],
  "timeline_weeks": 8,
  "total_budget": 75000,
  "risk_buffer": 15,
  "confidence": "high",
  "justification": "Brief explanation"
}
`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        context: 'budget_estimation'
      })
    });

    if (response.ok) {
      const data = await response.json();
      const estimate = JSON.parse(data.response || '{}');
      
      return {
        ...estimate,
        estimation_source: 'ai',
        generated_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.log('AI budget estimation failed, using fallback:', error);
  }

  // Fallback estimation based on features and issues
  const featureCount = release.features?.length || 0;
  const issueCount = release.issues?.length || 0;
  const complexity = featureCount + (issueCount * 0.5);

  const baseTeam = [
    { role: 'Frontend Developer', count: Math.max(1, Math.ceil(complexity / 8)), weeklyRate: 2500 },
    { role: 'Backend Developer', count: Math.max(1, Math.ceil(complexity / 10)), weeklyRate: 2800 },
    { role: 'QA Engineer', count: 1, weeklyRate: 2200 },
  ];

  if (complexity > 10) {
    baseTeam.push({ role: 'DevOps Engineer', count: 1, weeklyRate: 3000 });
  }

  const timelineWeeks = Math.max(4, Math.ceil(complexity / 2));
  const totalBudget = baseTeam.reduce((sum, member) => 
    sum + (member.count * member.weeklyRate * timelineWeeks), 0
  );

  return {
    team: baseTeam,
    timeline_weeks: timelineWeeks,
    total_budget: Math.round(totalBudget),
    risk_buffer: 20,
    confidence: 'medium',
    justification: 'Estimated based on feature complexity and standard team composition',
    estimation_source: 'fallback',
    generated_at: new Date().toISOString()
  };
};

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

export const addColorsAndIcons = (releases, budget) => {
  console.log('addColorsAndIcons: Processing releases:', releases);
  
  if (!releases || releases.length === 0) {
    console.log('addColorsAndIcons: No releases to process');
    return [];
  }

  const colors = ['#F9943B', '#0C5594', '#152944', '#F9943B', '#0C5594'];
  
  return releases.map((release, index) => {
    const releaseName = (release.name || release.release_name || '').toLowerCase();
    console.log('addColorsAndIcons: Processing release name:', releaseName);
    
    let icon = FaPlaneDeparture; // Default icon
    
    // Check for specific release types
    if (releaseName.includes('poc') || releaseName.includes('proof of concept')) {
      icon = FaCloudsmith; // Lab/experiment icon for POC
    } else if (releaseName.includes('mvp') || releaseName.includes('minimum viable')) {
      icon = FaHubspot; // Target icon for MVP
    } else if (releaseName.includes('beta')) {
      icon = FaQuestionCircle; // Test icon for beta
    } else if (releaseName.includes('alpha')) {
      icon = FaQuestionCircle; // Lightning for alpha
    } else if (releaseName.includes('final') || releaseName.includes('production') || releaseName.includes('v1.0')) {
      icon = FaRegCalendarCheck; // Check icon for final release
    }

    console.log('addColorsAndIcons: Assigned icon:', icon, 'for release:', releaseName);

    const bgColor = colors[index % colors.length];
    
    // Ensure proper date fields for Gantt chart
    let startDate = release.start_date || release.release_date;
    let endDate = release.end_date;
    
    // If no end date, calculate one based on start date + estimated duration
    if (!endDate && startDate) {
      const start = new Date(startDate);
      // Default to 2 weeks duration if no end date specified
      const estimatedDuration = 14; // days
      const end = new Date(start);
      end.setDate(start.getDate() + estimatedDuration);
      endDate = end.toISOString().split('T')[0];
    }
    
    // If no start date, use current date
    if (!startDate) {
      startDate = new Date().toISOString().split('T')[0];
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 14);
      endDate = end.toISOString().split('T')[0];
    }

    const processedRelease = {
      ...release,
      icon,
      bgColor,
      start_date: startDate,
      end_date: endDate,
      // Ensure we have proper display name
      name: release.name || release.release_name || `Release ${index + 1}`,
      // Add budget info if available
      budget: budget ? (budget / releases.length).toFixed(0) : null,
    };
    
    console.log('addColorsAndIcons: Final processed release:', processedRelease);
    return processedRelease;
  });
};
