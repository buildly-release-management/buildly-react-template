import { useState, useEffect, useCallback } from 'react';
import { oauthService } from '@modules/oauth/oauth.service';
import useAlert from '@hooks/useAlert';
import { devLog } from '@utils/devLogger';

/**
 * Hook for managing user session with automatic expiration warnings
 * @param {Object} options - Configuration options
 * @param {number} options.warningThresholdMinutes - Minutes before expiration to show warning (default: 30)
 * @param {number} options.checkIntervalSeconds - How often to check session status in seconds (default: 60)
 * @param {boolean} options.enableWarnings - Whether to show session warnings (default: true)
 * @returns {Object} Session management state and functions
 */
const useSessionManager = (options = {}) => {
  const {
    warningThresholdMinutes = 30,
    checkIntervalSeconds = 60,
    enableWarnings = true,
  } = options;

  const { displayAlert } = useAlert();
  const [sessionStatus, setSessionStatus] = useState({
    isValid: oauthService.hasValidAccessToken(),
    timeRemaining: oauthService.getTimeUntilExpiration(),
    formattedTimeRemaining: oauthService.getFormattedTimeUntilExpiration(),
    isAboutToExpire: oauthService.isSessionAboutToExpire(warningThresholdMinutes),
    hasShownWarning: false,
  });

  // Function to update session status
  const updateSessionStatus = useCallback(() => {
    const isValid = oauthService.hasValidAccessToken();
    const timeRemaining = oauthService.getTimeUntilExpiration();
    const formattedTimeRemaining = oauthService.getFormattedTimeUntilExpiration();
    const isAboutToExpire = oauthService.isSessionAboutToExpire(warningThresholdMinutes);

    setSessionStatus(prev => ({
      isValid,
      timeRemaining,
      formattedTimeRemaining,
      isAboutToExpire,
      hasShownWarning: prev.hasShownWarning,
    }));

    // Only log session changes, not every status update
    // devLog.log('Session status updated:', {
    //   isValid,
    //   timeRemaining,
    //   formattedTimeRemaining,
    //   isAboutToExpire,
    // });

    return { isValid, timeRemaining, formattedTimeRemaining, isAboutToExpire };
  }, [warningThresholdMinutes]);

  // Show session expiration warning
  const showSessionWarning = useCallback((timeRemaining) => {
    if (!enableWarnings) {return;}

    displayAlert('warning', 
      `Your session will expire in ${timeRemaining}. Please save your work and refresh the page to extend your session.`, 
      10000 // Show for 10 seconds
    );
    
    devLog.log('Session expiration warning displayed');
  }, [displayAlert, enableWarnings]);

  // Show session expired notification
  const showSessionExpired = useCallback(() => {
    if (!enableWarnings) {return;}

    displayAlert('error', 
      'Your session has expired. Please refresh the page and log in again.', 
      15000 // Show for 15 seconds
    );
    
    devLog.log('Session expired notification displayed');
  }, [displayAlert, enableWarnings]);

  // Handle session state changes
  useEffect(() => {
    const status = updateSessionStatus();
    
    // Show warning if session is about to expire and we haven't shown it yet
    if (status.isAboutToExpire && !sessionStatus.hasShownWarning && status.isValid) {
      showSessionWarning(status.formattedTimeRemaining);
      setSessionStatus(prev => ({ ...prev, hasShownWarning: true }));
    }
    
    // Show expired notification if session just expired
    if (!status.isValid && sessionStatus.isValid) {
      showSessionExpired();
      setSessionStatus(prev => ({ ...prev, hasShownWarning: false })); // Reset for next session
    }
  }, [sessionStatus.isValid, sessionStatus.hasShownWarning, updateSessionStatus, showSessionWarning, showSessionExpired]);

  // Set up periodic session checking
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateSessionStatus();
    }, checkIntervalSeconds * 1000);

    // Initial check
    updateSessionStatus();

    return () => clearInterval(intervalId);
  }, [updateSessionStatus, checkIntervalSeconds]);

  // Function to refresh session (user can call this to extend session)
  const refreshSession = useCallback(() => {
    // In a real app, you might want to make an API call to refresh the token
    // For now, we'll just update the session status
    const status = updateSessionStatus();
    
    if (status.isValid) {
      displayAlert('success', 'Session status refreshed.', 3000);
      setSessionStatus(prev => ({ ...prev, hasShownWarning: false })); // Reset warning flag
    } else {
      displayAlert('error', 'Session has expired. Please log in again.', 5000);
    }
    
    return status.isValid;
  }, [updateSessionStatus, displayAlert]);

  // Function to manually logout
  const logout = useCallback(() => {
    oauthService.logout();
    setSessionStatus({
      isValid: false,
      timeRemaining: 0,
      formattedTimeRemaining: 'Expired',
      isAboutToExpire: false,
      hasShownWarning: false,
    });
    
    displayAlert('info', 'You have been logged out.', 3000);
    
    // Redirect to login page
    window.location.href = '/';
  }, [displayAlert]);

  return {
    sessionStatus,
    refreshSession,
    logout,
    updateSessionStatus,
  };
};

export default useSessionManager;
