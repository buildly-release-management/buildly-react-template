/**
 * Debug Script for User UUID Extraction
 * Run this in browser console to test UUID extraction
 */

// Test function to run in browser console
function testUserUuidExtraction() {
  console.log('=== Testing User UUID Extraction ===');
  
  // 1. Check localStorage token
  const token = localStorage.getItem('token');
  console.log('1. Token in localStorage:', !!token);
  
  if (token) {
    try {
      const tokenData = JSON.parse(token);
      console.log('2. Token data structure:', Object.keys(tokenData));
      
      if (tokenData.access_token_jwt) {
        const payload = JSON.parse(atob(tokenData.access_token_jwt.split('.')[1]));
        console.log('3. JWT payload:', payload);
        console.log('4. JWT core_user_uuid:', payload.core_user_uuid);
        console.log('5. JWT user_id:', payload.user_id);
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }
  
  // 2. Check user context from localStorage
  const oauthUser = localStorage.getItem('oauthUser');
  console.log('6. OAuth user in localStorage:', !!oauthUser);
  
  if (oauthUser) {
    try {
      const userData = JSON.parse(oauthUser);
      console.log('7. OAuth user data:', userData);
    } catch (e) {
      console.error('Error parsing oauthUser:', e);
    }
  }
  
  // 3. Check current user
  const currentUser = localStorage.getItem('currentUser');
  console.log('8. Current user in localStorage:', !!currentUser);
  
  if (currentUser) {
    try {
      const currentUserData = JSON.parse(currentUser);
      console.log('9. Current user data:', currentUserData);
    } catch (e) {
      console.error('Error parsing currentUser:', e);
    }
  }
  
  console.log('=== End Test ===');
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.testUserUuidExtraction = testUserUuidExtraction;
  console.log('🔍 User UUID debug script loaded. Run window.testUserUuidExtraction() to test.');
}

export { testUserUuidExtraction };
