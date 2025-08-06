import { oauthService } from '@modules/oauth/oauth.service';
import { devLog } from '@utils/devLogger';
import request from './main';

/**
 * function to send a Http request to the API
 * @param {string} method - Http verb of the request (GET,POST,PUT,...)
 * @param {string} url - url endpoint to send request to e.g ‘contacts’
 * @param {any=} body - data of the request
 * @param {boolean=} useJwt - boolean to check if we want to use JWT or not
 * @param {string=} contentType - type of content to be requested
 * @param {string=} responseType - the expected response type from the server
 * @returns response of the request or error
 */
function makeRequest(method, url, body, useJwt, contentType, responseType, skipAuth = false) {
  let token;
  let tokenType;

  if (!skipAuth) {
    // if (useJwt) {
    //   tokenType = 'JWT';
    //   token = oauthService.getJwtToken();
    // } else {
    tokenType = 'Bearer';
    token = oauthService.getAccessToken();
    // }
  }

  // Enhanced logging for debugging
  devLog.log('makeRequest: Request details', {
    method,
    url,
    hasToken: !!token,
    tokenType,
    skipAuth,
    contentType: contentType || 'application/json'
  });

  const headers = {
    Authorization: `${tokenType} ${token}`,
    'Content-Type': contentType || 'application/json',
  };

  const options = {
    method,
    data: body,
    headers,
    returnPromise: true,
    responseType: responseType || null,
  };

  return request(url, options);
}

/**
 * Send a direct request to a specific service (product or release)
 * @param {string} endpoint - the endpoint path
 * @param {string} method - HTTP method
 * @param {any} body - request body
 * @param {string} service - service type ('product' or 'release')
 * @param {boolean} skipAuth - whether to skip authentication
 */
function sendDirectServiceRequest(endpoint, method = 'GET', body = null, service = 'product', skipAuth = false) {
  // Determine the base URL based on service type
  let baseUrl;
  if (service === 'product') {
    baseUrl = window.env.PRODUCT_SERVICE_URL;
  } else if (service === 'release') {
    baseUrl = window.env.RELEASE_SERVICE_URL;
  } else {
    baseUrl = window.env.API_URL;
  }

  // Construct full URL
  const url = `${baseUrl}${endpoint}`;
  
  devLog.log('sendDirectServiceRequest: Making request', {
    service,
    endpoint,
    method,
    baseUrl,
    fullUrl: url,
    skipAuth,
    hasToken: !skipAuth ? !!oauthService.getAccessToken() : 'N/A'
  });

  // Use existing makeRequest method
  return makeRequest(method.toLowerCase(), url, body, false, 'application/json', null, skipAuth);
}

export const httpService = {
  makeRequest,
  sendDirectServiceRequest,
};
