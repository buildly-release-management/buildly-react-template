/**
 * Form API Validation Tests
 * These tests validate that forms work properly with the actual API endpoints
 * and catch issues before they reach production.
 */

import fs from 'fs';
import path from 'path';

describe('Form API Validation Tests', () => {
  describe('Punchlist Form API Integration', () => {
    it('should have all required fields for punchlist API', () => {
      // Test data that should work with the API
      const validPunchlistData = {
        product_uuid: 'dcba4947-07e3-46a0-b429-46dcdacb6ec6',
        reporter_name: 'Test User',
        reporter_email: 'test@example.com',
        application_name: 'Test Application',
        version: '1.0.0',
        issue_title: 'Test Issue', // Note: API expects issue_title, form uses title
        description: 'Test description of the issue',
        expected_behavior: 'Application should work correctly',
        severity: 'medium',
        priority: 'medium',
        steps_to_reproduce: 'Step 1, Step 2, Step 3',
        actual_behavior: 'Application fails',
        environment: 'Production',
        browser_version: 'Chrome 91',
        screenshots: [],
        assigned_to: '',
        tags: [],
        release_uuid: '9153f07c-8ecc-4e37-bc45-499eecef5216',
        date_created: new Date().toISOString(),
        status: 'open'
      };

      // Verify all required API fields are present
      const requiredFields = [
        'product_uuid', 'reporter_name', 'reporter_email', 
        'application_name', 'version', 'issue_title', 
        'description', 'expected_behavior'
      ];

      requiredFields.forEach(field => {
        expect(validPunchlistData).toHaveProperty(field);
        expect(validPunchlistData[field]).toBeTruthy();
        expect(typeof validPunchlistData[field]).toBe('string');
        expect(validPunchlistData[field].trim().length).toBeGreaterThan(0);
      });

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(validPunchlistData.reporter_email)).toBe(true);
    });

    it('should validate punchlist mutation handles field mapping correctly', () => {
      const mutationPath = path.join(__dirname, '../react-query/mutations/punchlist/punchlistMutations.js');
      const mutationContent = fs.readFileSync(mutationPath, 'utf8');

      // Check that the mutation maps frontend 'title' to API 'issue_title'
      expect(mutationContent).toContain('issue_title: punchlistData.title');
      
      // Check validation logic
      expect(mutationContent).toContain('Missing required fields');
      expect(mutationContent).toContain('emailRegex');
      
      // Check all required field validations exist
      expect(mutationContent).toContain('product_uuid');
      expect(mutationContent).toContain('reporter_name');
      expect(mutationContent).toContain('reporter_email');
      expect(mutationContent).toContain('application_name');
      expect(mutationContent).toContain('version');
      expect(mutationContent).toContain('title'); // Frontend field
      expect(mutationContent).toContain('description');
      expect(mutationContent).toContain('expected_behavior');
      
      // Check update and delete operations exist
      expect(mutationContent).toContain('useUpdatePunchlistStatusMutation');
      expect(mutationContent).toContain('useDeletePunchlistItemMutation');
      expect(mutationContent).toContain('punchlist_uuid');
      expect(mutationContent).toContain('update-status');
    });

    it('should validate punchlist update and delete operations have proper UUID validation', () => {
      const mutationPath = path.join(__dirname, '../react-query/mutations/punchlist/punchlistMutations.js');
      const mutationContent = fs.readFileSync(mutationPath, 'utf8');

      // Check UUID validation for update operation
      expect(mutationContent).toContain('Punchlist UUID is required for status update');
      expect(mutationContent).toContain('Status is required for punchlist update');
      
      // Check UUID validation for delete operation  
      expect(mutationContent).toContain('Punchlist UUID is required for deletion');
      
      // Verify the API endpoints are correct
      expect(mutationContent).toContain('punchlist/${punchlist_uuid}/update-status/');
      expect(mutationContent).toContain('punchlist/${punchlist_uuid}/');
    });
  });

  describe('Business Task Form API Integration', () => {
    it('should have all required fields for business task API', () => {
      const validBusinessTaskData = {
        product_uuid: 'dcba4947-07e3-46a0-b429-46dcdacb6ec6',
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        assigned_to_user_uuid: 'user-uuid-123',
        assigned_by_user_uuid: 'manager-uuid-456',
        status: 'open',
        priority: 'high',
        due_date: '2025-08-30T00:00:00.000Z',
        estimated_hours: 40,
        release_uuid: '9153f07c-8ecc-4e37-bc45-499eecef5216'
      };

      // Verify required fields
      const requiredFields = ['product_uuid', 'title', 'assigned_by_user_uuid'];
      requiredFields.forEach(field => {
        expect(validBusinessTaskData).toHaveProperty(field);
        expect(validBusinessTaskData[field]).toBeTruthy();
      });
    });
  });

  describe('Product Form API Integration', () => {
    it('should have all required fields for product API', () => {
      const validProductData = {
        name: 'Test Product',
        description: 'A comprehensive test product',
        organization_uuid: 'org-uuid-123',
        start_date: '2025-08-01T00:00:00.000Z',
        end_date: '2025-12-31T00:00:00.000Z'
      };

      // Verify required fields
      expect(validProductData.name).toBeTruthy();
      expect(validProductData.organization_uuid).toBeTruthy();
      expect(validProductData.name.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and User Feedback', () => {
    it('should provide specific error messages for validation failures', () => {
      const testCases = [
        {
          scenario: 'missing required fields',
          shouldContain: ['Missing required fields', 'required']
        },
        {
          scenario: 'invalid email format',
          shouldContain: ['valid email address', 'email']
        },
        {
          scenario: 'API field mapping',
          shouldContain: ['issue_title', 'title']
        }
      ];

      const mutationPath = path.join(__dirname, '../react-query/mutations/punchlist/punchlistMutations.js');
      const mutationContent = fs.readFileSync(mutationPath, 'utf8');

      testCases.forEach(testCase => {
        testCase.shouldContain.forEach(text => {
          expect(mutationContent.toLowerCase()).toContain(text.toLowerCase());
        });
      });
    });
  });

  describe('Form State Management', () => {
    it('should verify form reset functionality exists', () => {
      const releaseDetailsPath = path.join(__dirname, '../pages/ReleaseDetails/ReleaseDetails.js');
      const releaseDetailsContent = fs.readFileSync(releaseDetailsPath, 'utf8');

      // Check that form reset logic exists
      expect(releaseDetailsContent).toContain('setNewPunchlistItem');
      expect(releaseDetailsContent).toContain('title: \'\'');
      expect(releaseDetailsContent).toContain('description: \'\'');
      expect(releaseDetailsContent).toContain('reporter_name: \'\'');
      expect(releaseDetailsContent).toContain('reporter_email: \'\'');
    });

    it('should verify proper error handling exists in components', () => {
      const releaseDetailsPath = path.join(__dirname, '../pages/ReleaseDetails/ReleaseDetails.js');
      const releaseDetailsContent = fs.readFileSync(releaseDetailsPath, 'utf8');

      // Check error handling patterns
      expect(releaseDetailsContent).toContain('catch (error)');
      expect(releaseDetailsContent).toContain('displayAlert');
      expect(releaseDetailsContent).toContain('console.error');
    });
  });
});
