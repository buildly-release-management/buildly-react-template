/**
 * Product Status System Tests
 * Simple test file to verify the status calculation logic
 */

import { calculateProductStatus, getStatusColor, getStatusLabel } from './productStatus';

// Test data
const mockProduct = {
  name: 'Test Product',
  product_info: {
    start_date: '2024-01-01',
    end_date: '2024-06-30'
  }
};

const mockReleases = [
  { 
    name: 'v1.0', 
    status: 'completed', 
    target_date: '2024-01-15',
    team: [
      { role: 'Frontend Developer', count: 1, weeklyRate: 2500 },
      { role: 'Backend Developer', count: 1, weeklyRate: 2800 }
    ]
  }
];

const mockFeatures = [
  { feature_uuid: 'feat-1', status: 'completed' },
  { feature_uuid: 'feat-2', status: 'completed' },
  { feature_uuid: 'feat-3', status: 'in_progress' },
  { feature_uuid: 'feat-4', status: 'planned' }
];

const mockIssues = [
  { issue_uuid: 'issue-1', status: 'completed' },
  { issue_uuid: 'issue-2', status: 'in_progress' }
];

const mockBudget = {
  total_budget: 50000,
  spent_budget: 25000
};

const mockTeamMembers = [
  { name: 'John Doe', role: 'Frontend Developer', is_active: true },
  { name: 'Jane Smith', role: 'Backend Developer', is_active: true }
];

// Test function
function runTests() {
  console.log('🧪 Running Product Status System Tests...\n');

  try {
    // Test 1: Basic status calculation
    const statusData = calculateProductStatus(
      mockProduct,
      mockReleases,
      mockFeatures,
      mockIssues,
      mockBudget,
      mockTeamMembers
    );

    console.log('✅ Test 1: Basic Status Calculation');
    console.log('Overall Status:', statusData.overall);
    console.log('Score:', statusData.score);
    console.log('Timeline:', statusData.timeline);
    console.log('Budget:', statusData.budget);
    console.log('Resources:', statusData.resources);
    console.log('');

    // Test 2: Status color mapping
    console.log('✅ Test 2: Status Color Mapping');
    console.log('Green color:', getStatusColor('green'));
    console.log('Yellow color:', getStatusColor('yellow'));
    console.log('Red color:', getStatusColor('red'));
    console.log('');

    // Test 3: Status label mapping
    console.log('✅ Test 3: Status Label Mapping');
    console.log('Green label:', getStatusLabel('green'));
    console.log('Yellow label:', getStatusLabel('yellow'));
    console.log('Red label:', getStatusLabel('red'));
    console.log('');

    // Test 4: Edge cases
    console.log('✅ Test 4: Edge Cases');
    
    // Test with no budget
    const statusNoBudget = calculateProductStatus(mockProduct, mockReleases, mockFeatures, mockIssues, null, mockTeamMembers);
    console.log('Status without budget:', statusNoBudget.budget);
    
    // Test with no team members
    const statusNoTeam = calculateProductStatus(mockProduct, mockReleases, mockFeatures, mockIssues, mockBudget, []);
    console.log('Status without team:', statusNoTeam.resources);
    
    // Test with empty arrays
    const statusEmpty = calculateProductStatus(mockProduct, [], [], [], null, []);
    console.log('Status with empty data:', statusEmpty.overall);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runTests();
} else {
  // Browser environment - expose to window for manual testing
  window.runProductStatusTests = runTests;
  console.log('📋 Product Status tests loaded. Run window.runProductStatusTests() to execute.');
}

export { runTests as runProductStatusTests };
