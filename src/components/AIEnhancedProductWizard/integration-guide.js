/**
 * Integration Guide for AI-Enhanced Product Wizard
 * 
 * This file shows how to integrate the new AI-Enhanced Product Wizard
 * to replace the existing static product wizard in your application.
 */

import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import AIEnhancedProductWizard from '@components/AIEnhancedProductWizard/AIEnhancedProductWizard';

/**
 * Example of how to integrate the AI wizard into your existing components
 * 
 * Replace the old NewProduct routing with this approach:
 * 
 * 1. In your routes file (src/routes/routesConstants.js), update:
 *    From: { path: '/new-product', component: NewProduct }
 *    To: { path: '/new-product', component: NewProductAI }
 * 
 * 2. Create a new wrapper component or update existing one:
 */

const NewProductAI = () => {
  const [wizardOpen, setWizardOpen] = useState(true);

  const handleWizardClose = () => {
    setWizardOpen(false);
    // Redirect to appropriate page (dashboard, portfolio, etc.)
    window.location.href = '/dashboard';
  };

  const handleWizardSave = (productData) => {
    console.log('Product created with AI wizard:', productData);
    // Additional handling if needed
  };

  return (
    <Box>
      <AIEnhancedProductWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onSave={handleWizardSave}
      />
    </Box>
  );
};

/**
 * Or integrate as a modal in existing pages:
 * 
 * Example usage in ProductPortfolio or Dashboard:
 */

const ProductPortfolioWithAIWizard = () => {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <Box>
      {/* Your existing ProductPortfolio content */}
      
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => setShowWizard(true)}
        size="large"
      >
        🚀 Create New Product (AI-Powered)
      </Button>

      <AIEnhancedProductWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={(data) => {
          console.log('New product created:', data);
          setShowWizard(false);
          // Refresh product list or navigate
        }}
      />
    </Box>
  );
};

/**
 * For editing existing products, pass editData:
 */

const EditProductExample = ({ existingProduct }) => {
  const [editWizardOpen, setEditWizardOpen] = useState(false);

  const handleEdit = () => {
    setEditWizardOpen(true);
  };

  return (
    <Box>
      <Button onClick={handleEdit}>Edit with AI Wizard</Button>
      
      <AIEnhancedProductWizard
        open={editWizardOpen}
        onClose={() => setEditWizardOpen(false)}
        editData={existingProduct} // Pre-populate wizard with existing data
        onSave={(updatedData) => {
          console.log('Product updated:', updatedData);
          setEditWizardOpen(false);
        }}
      />
    </Box>
  );
};

/**
 * Migration Steps:
 * 
 * 1. Update your routing:
 *    - Replace NewProduct component imports with NewProductAI
 *    - Update route configurations
 * 
 * 2. Update navigation links:
 *    - Change "Create Product" buttons to open the new wizard
 *    - Add AI-enhanced messaging to encourage usage
 * 
 * 3. Optional - Keep old wizard as fallback:
 *    - Add a "Use Classic Wizard" option for users who prefer it
 *    - Gradually deprecate the old wizard based on user feedback
 * 
 * 4. Update product creation flows:
 *    - Replace old product creation forms with the new wizard
 *    - Update any API calls to match the new data structure
 * 
 * 5. Testing:
 *    - Test the wizard with various product types
 *    - Verify all data is properly saved to your backend
 *    - Check that redirects and notifications work correctly
 */

export { NewProductAI, ProductPortfolioWithAIWizard, EditProductExample };
