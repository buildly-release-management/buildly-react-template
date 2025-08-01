import { httpService } from '@modules/http/http.service';

export const getReleaseProductReportQuery = async (product_uuid, displayAlert) => {
  try {
    console.log('getReleaseProductReportQuery: Fetching real release data for product:', product_uuid);
    
    // Fetch actual release data from existing endpoints
    const [releasesResponse, featuresResponse, issuesResponse] = await Promise.allSettled([
      httpService.makeRequest('get', `${window.env.API_URL}release/release/?product_uuid=${product_uuid}`),
      httpService.makeRequest('get', `${window.env.API_URL}release/feature/?product_uuid=${product_uuid}`),
      httpService.makeRequest('get', `${window.env.API_URL}release/issue/?product_uuid=${product_uuid}`)
    ]);
    
    // Extract data from responses
    const releases = releasesResponse.status === 'fulfilled' ? releasesResponse.value.data : [];
    const features = featuresResponse.status === 'fulfilled' ? featuresResponse.value.data : [];
    const issues = issuesResponse.status === 'fulfilled' ? issuesResponse.value.data : [];
    
    console.log('getReleaseProductReportQuery: Real data fetched:', {
      releases: releases.length,
      features: features.length,
      issues: issues.length
    });
    
    return {
      release_data: releases,
      issues_data: issues,
      features_data: features
    };
  } catch (error) {
    console.error('getReleaseProductReportQuery: Error fetching real data:', error);
    displayAlert('error', "Couldn't fetch release product report!");
    return {
      release_data: [],
      issues_data: [],
      features_data: []
    };
  }
};
