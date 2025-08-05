/**
 * User UUID Utility for Business Tasks
 * Robust user identification extraction from multiple sources
 */

/**
 * Extract user UUID from various sources with fallback options
 * @param {Object} userContext - User context from UserContext
 * @returns {string|null} - Valid user UUID or null
 */
export const extractUserUuid = (userContext) => {
  // Method 1: Direct from user context
  if (userContext?.core_user_uuid) {
    return userContext.core_user_uuid;
  }
  
  // Method 2: Fallback to other user context fields
  if (userContext?.user_uuid) {
    return userContext.user_uuid;
  }
  
  if (userContext?.user_id) {
    return userContext.user_id;
  }
  
  if (userContext?.id) {
    return userContext.id;
  }
  
  // Method 3: Extract from JWT token directly
  try {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const tokenData = JSON.parse(jwtToken);
      if (tokenData.access_token_jwt) {
        // Decode JWT payload
        const payload = JSON.parse(atob(tokenData.access_token_jwt.split('.')[1]));
        if (payload.core_user_uuid) {
          return payload.core_user_uuid;
        }
        if (payload.user_id) {
          return payload.user_id.toString();
        }
      }
    }
  } catch (e) {
    // Silent fail for JWT parsing errors
  }
  
  return null;
};

/**
 * Validate that a UUID string is properly formatted
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid UUID format
 */
export const isValidUuid = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Get current user's UUID with validation
 * @param {Object} userContext - User context from UserContext
 * @returns {Object} - { uuid: string|null, isValid: boolean, source: string }
 */
export const getCurrentUserUuid = (userContext) => {
  const uuid = extractUserUuid(userContext);
  const isValid = isValidUuid(uuid);
  
  let source = 'unknown';
  if (userContext?.core_user_uuid === uuid) source = 'user_context_core';
  else if (userContext?.user_uuid === uuid) source = 'user_context_user';
  else if (userContext?.user_id === uuid) source = 'user_context_id';
  else if (userContext?.id === uuid) source = 'user_context_generic_id';
  else source = 'jwt_token';
  
  return {
    uuid,
    isValid,
    source
  };
};

export default {
  extractUserUuid,
  isValidUuid,
  getCurrentUserUuid
};
