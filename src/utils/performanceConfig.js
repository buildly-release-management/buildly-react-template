/**
 * Production Performance Optimization Utilities
 * Provides optimized settings based on the PRODUCTION environment variable
 */

/**
 * Get React Query cache settings optimized for current environment
 * @returns {Object} Cache configuration object
 */
export const getOptimizedCacheSettings = () => {
  const isProduction = window.env?.PRODUCTION;
  
  return {
    // Stale time - how long data is considered fresh
    staleTime: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15min prod, 5min dev
    
    // Cache time - how long to keep data in cache when not in use
    cacheTime: isProduction ? 60 * 60 * 1000 : 10 * 60 * 1000, // 1hr prod, 10min dev
    
    // Retry settings for failed requests
    retry: isProduction ? 3 : 1,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Background refetch settings
    refetchOnWindowFocus: !isProduction, // Disable in production for better performance
    refetchOnReconnect: true,
    refetchOnMount: true,
    
    // Network mode
    networkMode: isProduction ? 'online' : 'always',
  };
};

/**
 * Get optimized settings for specific data types
 */
export const getCacheSettingsFor = {
  // User data - changes infrequently
  userData: () => ({
    ...getOptimizedCacheSettings(),
    staleTime: window.env?.PRODUCTION ? 30 * 60 * 1000 : 10 * 60 * 1000, // 30min prod, 10min dev
    cacheTime: window.env?.PRODUCTION ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000, // 2hr prod, 30min dev
  }),
  
  // Organization members - changes infrequently  
  organizationMembers: () => ({
    ...getOptimizedCacheSettings(),
    staleTime: window.env?.PRODUCTION ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15min prod, 5min dev
    cacheTime: window.env?.PRODUCTION ? 60 * 60 * 1000 : 10 * 60 * 1000, // 1hr prod, 10min dev
  }),
  
  // Product data - changes moderately
  productData: () => ({
    ...getOptimizedCacheSettings(),
    staleTime: window.env?.PRODUCTION ? 10 * 60 * 1000 : 2 * 60 * 1000, // 10min prod, 2min dev
    cacheTime: window.env?.PRODUCTION ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30min prod, 5min dev
  }),
  
  // Real-time data (tasks, releases) - changes frequently
  realTimeData: () => ({
    ...getOptimizedCacheSettings(),
    staleTime: window.env?.PRODUCTION ? 2 * 60 * 1000 : 30 * 1000, // 2min prod, 30sec dev
    cacheTime: window.env?.PRODUCTION ? 10 * 60 * 1000 : 2 * 60 * 1000, // 10min prod, 2min dev
  }),
};

/**
 * Check if we're in production mode
 * @returns {boolean} True if in production
 */
export const isProductionMode = () => {
  return Boolean(window.env?.PRODUCTION);
};

/**
 * Get performance mode string for logging/debugging
 * @returns {string} 'production' or 'development'
 */
export const getPerformanceMode = () => {
  return isProductionMode() ? 'production' : 'development';
};

/**
 * Production-optimized console logging
 * Only logs in development mode unless it's an error
 */
export const performanceLog = {
  info: (message, ...args) => {
    if (!isProductionMode()) {
      console.info(`[${getPerformanceMode()}]`, message, ...args);
    }
  },
  warn: (message, ...args) => {
    if (!isProductionMode()) {
      console.warn(`[${getPerformanceMode()}]`, message, ...args);
    }
  },
  error: (message, ...args) => {
    // Always log errors, even in production
    console.error(`[${getPerformanceMode()}]`, message, ...args);
  },
  debug: (message, ...args) => {
    if (!isProductionMode()) {
      console.debug(`[${getPerformanceMode()}]`, message, ...args);
    }
  }
};

export default {
  getOptimizedCacheSettings,
  getCacheSettingsFor,
  isProductionMode,
  getPerformanceMode,
  performanceLog
};
