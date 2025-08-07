import { httpService } from '@modules/http/http.service';
import { devLog } from '@utils/devLogger';

export const getReleaseProductReportQuery = async (product_uuid, displayAlert) => {
  try {
    // Optimized parallel requests with better error handling
    const [releasesResponse, featuresResponse, issuesResponse] = await Promise.allSettled([
      httpService.makeRequest('get', `${window.env.API_URL}release/release/?product_uuid=${product_uuid}`),
      httpService.makeRequest('get', `${window.env.API_URL}release/feature/?product_uuid=${product_uuid}`),
      httpService.makeRequest('get', `${window.env.API_URL}release/issue/?product_uuid=${product_uuid}`)
    ]);
    
    // Extract data from responses with better error handling
    const releases = releasesResponse.status === 'fulfilled' ? releasesResponse.value.data || [] : [];
    const features = featuresResponse.status === 'fulfilled' ? featuresResponse.value.data || [] : [];
    const issues = issuesResponse.status === 'fulfilled' ? issuesResponse.value.data || [] : [];
    
    devLog.log('Release Product Report - Raw data counts:', {
      releases: releases.length,
      features: features.length, 
      issues: issues.length
    });

    // Pre-process and optimize data structure for faster Timeline rendering
    const processedReleases = releases.map(release => {
      // Map features to this release
      const releaseFeatures = features.filter(feature => 
        feature.release_uuid === release.release_uuid
      );
      
      // Map issues to this release (multiple strategies for better matching)
      const releaseIssues = issues.filter(issue => 
        issue.release_uuid === release.release_uuid ||
        issue.feature_uuid && releaseFeatures.some(f => f.feature_uuid === issue.feature_uuid)
      );
      
      devLog.log(`Release ${release.name}: ${releaseFeatures.length} features, ${releaseIssues.length} issues`);
      
      return {
        ...release,
        features: releaseFeatures.map(feature => ({
          feature_uuid: feature.feature_uuid,
          name: feature.feature_name || feature.name,
          description: feature.description,
          status: feature.status,
          priority: feature.priority,
          estimated_completion_date: feature.estimated_completion_date
        })),
        issues: releaseIssues.map(issue => ({
          issue_uuid: issue.issue_uuid,
          name: issue.issue_name || issue.name,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          issue_type: issue.issue_type
        }))
      };
    });
    
    devLog.log('Processed releases with embedded features/issues:', processedReleases.length);
    
    return {
      release_data: processedReleases,
      issues_data: issues,
      features_data: features
    };
  } catch (error) {
    devLog.error('getReleaseProductReportQuery: Error fetching data:', error);
    if (displayAlert) {
      displayAlert('error', "Couldn't fetch release product report!");
    }
    return {
      release_data: [],
      issues_data: [],
      features_data: []
    };
  }
};
